// backend/KineticWorkspace.API/Services/Implementations/PreReservationService.cs
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.DTOs.PreReservations;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Services.Implementations
{
    public class PreReservationService : IPreReservationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ISpaceRepository _spaceRepository;
        private readonly IReservationRepository _reservationRepository;
        private readonly IInvoiceService _invoiceService;
        private readonly IMapper _mapper;
        private readonly ILogger<PreReservationService> _logger;

        private static readonly TimeSpan ExpirationTime = TimeSpan.FromMinutes(30);

        public PreReservationService(
            ApplicationDbContext context,
            ISpaceRepository spaceRepository,
            IReservationRepository reservationRepository,
            IInvoiceService invoiceService,
            IMapper mapper,
            ILogger<PreReservationService> logger)
        {
            _context = context;
            _spaceRepository = spaceRepository;
            _reservationRepository = reservationRepository;
            _invoiceService = invoiceService;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<PreReservationResponseDto> CreatePreReservationAsync(PreReservationRequestDto request, int userId)
        {
            ValidateDates(request.StartTime, request.EndTime);

            var isAvailable = await _spaceRepository.IsSpaceAvailableAsync(request.SpaceId, request.StartTime, request.EndTime);
            if (!isAvailable)
            {
                throw new InvalidOperationException("El espacio no está disponible en el horario seleccionado");
            }

            var space = await _spaceRepository.GetByIdAsync(request.SpaceId);
            if (space == null)
            {
                throw new InvalidOperationException("Espacio no encontrado");
            }

            var numberOfGuests = request.NumberOfGuests ?? space.Capacity;
            if (numberOfGuests > space.Capacity)
            {
                throw new InvalidOperationException($"La capacidad máxima del espacio es de {space.Capacity} personas");
            }

            var totalPrice = CalculateTotalPrice(space, request.StartTime, request.EndTime);

            // Eliminar pre-reservas activas con el mismo sessionId
            if (!string.IsNullOrEmpty(request.SessionId))
            {
                var existingPreReservations = await _context.PreReservations
                    .Where(pr => pr.UserId == userId &&
                                 pr.SessionId == request.SessionId &&
                                 pr.Status == "Pending")
                    .ToListAsync();

                if (existingPreReservations.Any())
                {
                    _context.PreReservations.RemoveRange(existingPreReservations);
                    await _context.SaveChangesAsync();
                }
            }

            var preReservation = new PreReservation
            {
                UserId = userId,
                SpaceId = request.SpaceId,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Status = "Pending",
                Notes = request.Notes,
                NumberOfGuests = numberOfGuests,
                TotalPrice = totalPrice,
                SessionId = request.SessionId,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.Add(ExpirationTime)
            };

            await _context.PreReservations.AddAsync(preReservation);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Pre-reserva creada: {PreReservationId} para usuario {UserId}", preReservation.Id, userId);

            return MapToResponseDto(preReservation);
        }

        public async Task<PreReservationResponseDto?> GetPreReservationByIdAsync(int id, int userId)
        {
            var preReservation = await _context.PreReservations
                .Include(pr => pr.User)
                .Include(pr => pr.Space)
                .FirstOrDefaultAsync(pr => pr.Id == id && pr.UserId == userId);

            if (preReservation == null) return null;

            return MapToResponseDto(preReservation);
        }

        public async Task<IEnumerable<PreReservationResponseDto>> GetUserPreReservationsAsync(int userId, string? status = null)
        {
            var query = _context.PreReservations
                .Include(pr => pr.User)
                .Include(pr => pr.Space)
                .Where(pr => pr.UserId == userId);

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(pr => pr.Status == status);
            }
            else
            {
                query = query.Where(pr => pr.Status == "Pending" || pr.Status == "PaymentPending");
            }

            var preReservations = await query
                .OrderByDescending(pr => pr.CreatedAt)
                .ToListAsync();

            return preReservations.Select(MapToResponseDto);
        }

        public async Task<PreReservationPaymentResponseDto> ProcessPaymentAsync(PreReservationPaymentRequestDto request, int userId)
        {
            var preReservation = await _context.PreReservations
                .Include(pr => pr.Space)
                .FirstOrDefaultAsync(pr => pr.Id == request.PreReservationId && pr.UserId == userId);

            if (preReservation == null)
            {
                throw new InvalidOperationException("Pre-reserva no encontrada");
            }

            // ✅ CORREGIDO: Evaluar expiración en el código, no en SQL
            if (preReservation.ExpiresAt.HasValue && DateTime.UtcNow >= preReservation.ExpiresAt.Value)
            {
                preReservation.Status = "Expired";
                await _context.SaveChangesAsync();
                throw new InvalidOperationException("La pre-reserva ha expirado. Por favor, crea una nueva.");
            }

            if (preReservation.Status == "Paid")
            {
                throw new InvalidOperationException("Esta pre-reserva ya ha sido pagada");
            }

            var paymentIntentId = $"pi_{Guid.NewGuid():N}";
            var clientSecret = $"secret_{Guid.NewGuid():N}";

            preReservation.PaymentMethod = request.PaymentMethod;
            preReservation.PaymentIntentId = paymentIntentId;
            preReservation.Status = "PaymentPending";
            preReservation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Pago iniciado para pre-reserva {PreReservationId}. PaymentIntent: {PaymentIntentId}",
                preReservation.Id, paymentIntentId);

            return new PreReservationPaymentResponseDto
            {
                PreReservationId = preReservation.Id,
                Status = preReservation.Status,
                PaymentIntentId = paymentIntentId,
                ClientSecret = clientSecret,
                Amount = preReservation.TotalPrice,
                Currency = "USD",
                ExpiresAt = preReservation.ExpiresAt ?? DateTime.UtcNow.Add(ExpirationTime)
            };
        }

        public async Task<PreReservationConfirmResponseDto> ConfirmPaymentAsync(PreReservationConfirmRequestDto request, int userId)
        {
            _logger.LogInformation($"Confirmando pago para PreReservationId: {request.PreReservationId}, UserId: {userId}");

            var preReservation = await _context.PreReservations
                .Include(pr => pr.User)
                .Include(pr => pr.Space)
                .FirstOrDefaultAsync(pr => pr.Id == request.PreReservationId && pr.UserId == userId);

            if (preReservation == null)
            {
                _logger.LogWarning($"Pre-reserva no encontrada: {request.PreReservationId}");
                throw new InvalidOperationException("Pre-reserva no encontrada");
            }

            _logger.LogInformation($"Pre-reserva encontrada: Status={preReservation.Status}, PaymentIntentId={preReservation.PaymentIntentId}");

            if (preReservation.Status != "PaymentPending")
            {
                _logger.LogWarning($"Estado incorrecto: {preReservation.Status}");
                throw new InvalidOperationException($"La pre-reserva no está en estado de pago pendiente. Estado actual: {preReservation.Status}");
            }

            if (preReservation.PaymentIntentId != request.PaymentIntentId)
            {
                _logger.LogWarning($"PaymentIntentId no coincide. Esperado: {preReservation.PaymentIntentId}, Recibido: {request.PaymentIntentId}");
                throw new InvalidOperationException("El PaymentIntentId no coincide");
            }

            // ✅ CORREGIDO: Evaluar expiración
            if (preReservation.ExpiresAt.HasValue && DateTime.UtcNow >= preReservation.ExpiresAt.Value)
            {
                preReservation.Status = "Expired";
                await _context.SaveChangesAsync();
                _logger.LogWarning($"Pre-reserva expirada: {request.PreReservationId}");
                throw new InvalidOperationException("La pre-reserva ha expirado");
            }

            var transactionId = $"txn_{Guid.NewGuid():N}";

            // ✅ USAR Execution Strategy CORRECTAMENTE
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                // ✅ INICIAR TRANSACCIÓN DENTRO DE LA ESTRATEGIA
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // 1. Crear la reserva definitiva
                    var reservation = new Reservation
                    {
                        UserId = preReservation.UserId,
                        SpaceId = preReservation.SpaceId,
                        StartTime = preReservation.StartTime,
                        EndTime = preReservation.EndTime,
                        Status = "Confirmed",
                        Notes = preReservation.Notes,
                        NumberOfGuests = preReservation.NumberOfGuests,
                        TotalPrice = preReservation.TotalPrice,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    await _context.Reservations.AddAsync(reservation);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Reserva creada: {reservation.Id}");

                    // 2. Crear la factura
                    var invoice = await _invoiceService.CreateInvoiceAsync(
                        preReservation.UserId,
                        reservation.Id,
                        preReservation.TotalPrice,
                        preReservation.PaymentMethod ?? "CreditCard",
                        transactionId
                    );
                    _logger.LogInformation($"Factura creada: {invoice.InvoiceNumber}");

                    await _invoiceService.MarkInvoiceAsPaidAsync(invoice.Id, transactionId);

                    // 3. Crear el pago
                    var payment = new Payment
                    {
                        ReservationId = reservation.Id,
                        UserId = preReservation.UserId,
                        InvoiceId = invoice.Id,
                        Amount = preReservation.TotalPrice,
                        Status = "Completed",
                        PaymentMethod = preReservation.PaymentMethod ?? "CreditCard",
                        TransactionId = transactionId,
                        PaymentIntentId = preReservation.PaymentIntentId,
                        CreatedAt = DateTime.UtcNow,
                        CompletedAt = DateTime.UtcNow
                    };

                    await _context.Payments.AddAsync(payment);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Pago creado: {payment.Id}");

                    // 4. Actualizar pre-reserva
                    preReservation.Status = "Paid";
                    preReservation.PaidAmount = preReservation.TotalPrice;
                    preReservation.PaidAt = DateTime.UtcNow;
                    preReservation.TransactionId = transactionId;
                    preReservation.UpdatedAt = DateTime.UtcNow;

                    await _context.SaveChangesAsync();

                    // ✅ CONFIRMAR TRANSACCIÓN
                    await transaction.CommitAsync();

                    _logger.LogInformation($"✅ Pago completado exitosamente. Reserva: {reservation.Id}, Factura: {invoice.InvoiceNumber}");

                    return new PreReservationConfirmResponseDto
                    {
                        ReservationId = reservation.Id,
                        InvoiceId = invoice.Id,
                        InvoiceNumber = invoice.InvoiceNumber,
                        Status = "Completed",
                        TotalAmount = preReservation.TotalPrice,
                        PaidAmount = preReservation.TotalPrice,
                        PaidAt = DateTime.UtcNow,
                        PaymentMethod = preReservation.PaymentMethod ?? "CreditCard",
                        TransactionId = transactionId
                    };
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, $"Error al confirmar pago para PreReservationId: {request.PreReservationId}");
                    throw;
                }
            });
        }

        public async Task<bool> CancelPreReservationAsync(int id, int userId, string? reason = null)
        {
            var preReservation = await _context.PreReservations
                .FirstOrDefaultAsync(pr => pr.Id == id && pr.UserId == userId);

            if (preReservation == null) return false;

            if (preReservation.Status == "Paid")
            {
                throw new InvalidOperationException("No se puede cancelar una pre-reserva ya pagada");
            }

            preReservation.Status = "Cancelled";
            preReservation.CancelledAt = DateTime.UtcNow;
            preReservation.CancellationReason = reason;
            preReservation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Pre-reserva cancelada: {PreReservationId}", id);
            return true;
        }

        public async Task<int> CleanExpiredPreReservationsAsync()
        {
            var now = DateTime.UtcNow;

            // ✅ CORREGIDO: Evaluar expiración en el código, no en SQL
            var expired = await _context.PreReservations
                .Where(pr => pr.ExpiresAt < now &&
                             pr.Status != "Paid" &&
                             pr.Status != "Cancelled")
                .ToListAsync();

            if (expired.Any())
            {
                foreach (var pr in expired)
                {
                    pr.Status = "Expired";
                    pr.UpdatedAt = DateTime.UtcNow;
                }
                await _context.SaveChangesAsync();
                _logger.LogInformation("Se limpiaron {Count} pre-reservas expiradas", expired.Count);
            }

            return expired.Count;
        }

        // ✅ CORREGIDO: Método GetActiveCartBySessionIdAsync
        public async Task<PreReservationResponseDto?> GetActiveCartBySessionIdAsync(string sessionId, int userId)
        {
            // ✅ Obtener la pre-reserva sin usar propiedades [NotMapped] en la consulta
            var preReservation = await _context.PreReservations
                .Include(pr => pr.User)
                .Include(pr => pr.Space)
                .FirstOrDefaultAsync(pr => pr.SessionId == sessionId &&
                                          pr.UserId == userId &&
                                          pr.Status == "Pending");

            // ✅ Verificar expiración en el código después de obtener el objeto
            if (preReservation == null) return null;

            // Verificar si expiró
            if (preReservation.ExpiresAt.HasValue && DateTime.UtcNow >= preReservation.ExpiresAt.Value)
            {
                preReservation.Status = "Expired";
                await _context.SaveChangesAsync();
                return null;
            }

            return MapToResponseDto(preReservation);
        }

        // ==================== MÉTODOS AUXILIARES ====================

        private void ValidateDates(DateTime startTime, DateTime endTime)
        {
            if (startTime >= endTime)
                throw new InvalidOperationException("La fecha de inicio debe ser anterior a la fecha de fin");

            if (startTime < DateTime.UtcNow.AddMinutes(-1))
                throw new InvalidOperationException("No se pueden hacer reservas en el pasado");

            var maxDuration = TimeSpan.FromDays(30);
            if (endTime - startTime > maxDuration)
                throw new InvalidOperationException($"La duración máxima es de {maxDuration.Days} días");

            var minDuration = TimeSpan.FromMinutes(30);
            if (endTime - startTime < minDuration)
                throw new InvalidOperationException($"La duración mínima es de {minDuration.Minutes} minutos");
        }

        private decimal CalculateTotalPrice(Space space, DateTime startTime, DateTime endTime)
        {
            var totalHours = (endTime - startTime).TotalHours;
            var totalDays = (endTime.Date - startTime.Date).Days;

            if (totalDays >= 1 && space.PricePerDay.HasValue && space.PricePerDay.Value > 0)
            {
                var days = totalDays;
                var remainingHours = totalHours % 24;
                return (decimal)days * space.PricePerDay.Value + (decimal)remainingHours * space.PricePerHour;
            }

            return space.PricePerHour * (decimal)totalHours;
        }

        private PreReservationResponseDto MapToResponseDto(PreReservation preReservation)
        {
            var isExpired = preReservation.ExpiresAt.HasValue && DateTime.UtcNow >= preReservation.ExpiresAt.Value;
            var isPending = preReservation.Status == "Pending" || preReservation.Status == "PaymentPending";
            var isPaid = preReservation.Status == "Paid";

            return new PreReservationResponseDto
            {
                Id = preReservation.Id,
                UserId = preReservation.UserId,
                UserName = preReservation.User != null ? $"{preReservation.User.FirstName} {preReservation.User.LastName}" : string.Empty,
                SpaceId = preReservation.SpaceId,
                SpaceName = preReservation.Space?.Name ?? string.Empty,
                SpaceType = preReservation.Space?.Type ?? string.Empty,
                SpaceImageUrl = !string.IsNullOrEmpty(preReservation.Space?.ImageUrls)
                    ? preReservation.Space.ImageUrls.Split(',').FirstOrDefault()
                    : null,
                StartTime = preReservation.StartTime,
                EndTime = preReservation.EndTime,
                Status = preReservation.Status,
                Notes = preReservation.Notes,
                TotalPrice = preReservation.TotalPrice,
                NumberOfGuests = preReservation.NumberOfGuests,
                PaymentMethod = preReservation.PaymentMethod,
                PaidAmount = preReservation.PaidAmount,
                CreatedAt = preReservation.CreatedAt,
                ExpiresAt = preReservation.ExpiresAt,
                PaidAt = preReservation.PaidAt,
                ExpiresInMinutes = preReservation.ExpiresAt.HasValue
                    ? (int)(preReservation.ExpiresAt.Value - DateTime.UtcNow).TotalMinutes
                    : (int)ExpirationTime.TotalMinutes,
                IsExpired = isExpired,
                IsPending = isPending,
                IsPaid = isPaid
            };
        }
    }
}