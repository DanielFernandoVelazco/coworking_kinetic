// backend/KineticWorkspace.API/Services/Implementations/ReservationService.cs
using AutoMapper;
using KineticWorkspace.API.Models.DTOs.Reservations;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Services.Implementations
{
    public class ReservationService : IReservationService
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly ISpaceRepository _spaceRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<ReservationService> _logger;

        public ReservationService(
            IReservationRepository reservationRepository,
            ISpaceRepository spaceRepository,
            IMapper mapper,
            ILogger<ReservationService> logger)
        {
            _reservationRepository = reservationRepository;
            _spaceRepository = spaceRepository;
            _mapper = mapper;
            _logger = logger;
        }

        // ==================== MÉTODOS EXISTENTES ====================

        public async Task<IEnumerable<ReservationResponseDto>> GetUserReservationsAsync(int userId)
        {
            var reservations = await _reservationRepository.GetUserReservationsAsync(userId);
            return _mapper.Map<IEnumerable<ReservationResponseDto>>(reservations);
        }

        public async Task<IEnumerable<ReservationResponseDto>> GetSpaceReservationsAsync(int spaceId)
        {
            var reservations = await _reservationRepository.GetSpaceReservationsAsync(spaceId);
            return _mapper.Map<IEnumerable<ReservationResponseDto>>(reservations);
        }

        public async Task<ReservationResponseDto?> GetReservationByIdAsync(int id)
        {
            var reservation = await _reservationRepository.GetReservationWithDetailsAsync(id);
            return reservation != null ? _mapper.Map<ReservationResponseDto>(reservation) : null;
        }

        public async Task<ReservationResponseDto> CreateReservationAsync(ReservationRequestDto request, int userId)
        {
            ValidateReservationDates(request.StartTime, request.EndTime);

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
                throw new InvalidOperationException($"La capacidad máxima del espacio es de {space.Capacity} personas. Has seleccionado {numberOfGuests}.");
            }

            var totalPrice = CalculateTotalPrice(space, request.StartTime, request.EndTime);

            var reservation = new Reservation
            {
                UserId = userId,
                SpaceId = request.SpaceId,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Status = "Pending",
                Notes = request.Notes,
                NumberOfGuests = numberOfGuests,
                TotalPrice = totalPrice,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createdReservation = await _reservationRepository.AddAsync(reservation);
            _logger.LogInformation("Nueva reservación creada: {ReservationId}", createdReservation.Id);

            return _mapper.Map<ReservationResponseDto>(createdReservation);
        }

        // ==================== MÉTODO UPDATE CORREGIDO ====================

        public async Task<ReservationResponseDto?> UpdateReservationAsync(int id, ReservationRequestDto request, int userId, bool isAdmin = false)
        {
            ValidateReservationDates(request.StartTime, request.EndTime);

            var reservation = await _reservationRepository.GetReservationWithDetailsAsync(id);
            if (reservation == null) return null;

            // ✅ PERMITIR: Si es administrador, puede modificar cualquier reserva
            // ✅ PERMITIR: Si es el propietario, puede modificar su propia reserva
            if (reservation.UserId != userId && !isAdmin)
            {
                throw new UnauthorizedAccessException("No tienes permiso para modificar esta reservación");
            }

            // Si no es admin, verificar que la reserva no esté cancelada o completada
            if (!isAdmin)
            {
                if (reservation.Status == "Cancelled" || reservation.Status == "Completed")
                {
                    throw new InvalidOperationException("No se puede modificar una reservación cancelada o completada");
                }
            }

            var isAvailable = await _spaceRepository.IsSpaceAvailableAsync(request.SpaceId, request.StartTime, request.EndTime, id);
            if (!isAvailable)
            {
                throw new InvalidOperationException("El espacio no está disponible en el nuevo horario");
            }

            var space = await _spaceRepository.GetByIdAsync(request.SpaceId);
            if (space == null)
            {
                throw new InvalidOperationException("Espacio no encontrado");
            }

            var numberOfGuests = request.NumberOfGuests ?? space.Capacity;
            if (numberOfGuests > space.Capacity)
            {
                throw new InvalidOperationException($"La capacidad máxima del espacio es de {space.Capacity} personas. Has seleccionado {numberOfGuests}.");
            }

            var totalPrice = CalculateTotalPrice(space, request.StartTime, request.EndTime);

            // ✅ Guardar el usuario anterior para el log
            var previousUserId = reservation.UserId;
            var previousSpaceId = reservation.SpaceId;
            var previousStartTime = reservation.StartTime;
            var previousEndTime = reservation.EndTime;

            // ✅ Actualizar datos
            reservation.SpaceId = request.SpaceId;
            reservation.StartTime = request.StartTime;
            reservation.EndTime = request.EndTime;
            reservation.Notes = request.Notes;
            reservation.NumberOfGuests = numberOfGuests;
            reservation.TotalPrice = totalPrice;
            reservation.UpdatedAt = DateTime.UtcNow;

            // ✅ Si el admin cambió el usuario, actualizar el UserId
            if (isAdmin && request.UserId.HasValue && request.UserId.Value > 0)
            {
                reservation.UserId = request.UserId.Value;
            }

            await _reservationRepository.UpdateAsync(reservation);

            // ✅ Log de cambios
            _logger.LogInformation(
                "Reservación {ReservationId} actualizada por Admin {AdminId}. " +
                "Usuario: {PreviousUserId} → {NewUserId}, " +
                "Espacio: {PreviousSpaceId} → {NewSpaceId}, " +
                "Inicio: {PreviousStart} → {NewStart}, " +
                "Fin: {PreviousEnd} → {NewEnd}",
                id, userId, previousUserId, reservation.UserId,
                previousSpaceId, reservation.SpaceId,
                previousStartTime, reservation.StartTime,
                previousEndTime, reservation.EndTime
            );

            return _mapper.Map<ReservationResponseDto>(reservation);
        }

        // ==================== MÉTODOS CON FILTROS ====================

        public async Task<PaginatedReservationResponseDto> GetUserReservationsFilteredAsync(
            int userId,
            int page,
            int pageSize,
            string? sortBy,
            string? status)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var (items, totalCount) = await _reservationRepository.GetUserReservationsFilteredAsync(
                userId, page, pageSize, sortBy, status);

            var mappedItems = _mapper.Map<IEnumerable<ReservationResponseDto>>(items);

            return new PaginatedReservationResponseDto
            {
                Items = mappedItems.ToList(),
                CurrentPage = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                TotalCount = totalCount,
                SortBy = sortBy ?? "date_desc",
                Status = status ?? "all"
            };
        }

        // ==================== NUEVO: MÉTODO PARA ADMIN ====================

        public async Task<PaginatedReservationResponseDto> GetAllReservationsFilteredAsync(
            int page,
            int pageSize,
            string? sortBy,
            string? status,
            string? searchTerm,
            int? userId,
            int? spaceId)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 15;
            if (pageSize > 100) pageSize = 100;

            var (items, totalCount) = await _reservationRepository.GetAllReservationsFilteredAsync(
                page, pageSize, sortBy, status, searchTerm, userId, spaceId);

            var mappedItems = _mapper.Map<IEnumerable<ReservationResponseDto>>(items);

            return new PaginatedReservationResponseDto
            {
                Items = mappedItems.ToList(),
                CurrentPage = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                TotalCount = totalCount,
                SortBy = sortBy ?? "date_desc",
                Status = status ?? "all"
            };
        }

        // ==================== MÉTODOS EXISTENTES ====================

        public async Task<bool> CancelReservationAsync(int id, int userId, string reason)
        {
            var reservation = await _reservationRepository.GetReservationWithDetailsAsync(id);
            if (reservation == null) return false;

            if (reservation.UserId != userId)
            {
                throw new UnauthorizedAccessException("No tienes permiso para cancelar esta reservación");
            }

            if (reservation.Status == "Completed")
            {
                throw new InvalidOperationException("No se puede cancelar una reservación completada");
            }

            reservation.UpdatedAt = DateTime.UtcNow;

            return await _reservationRepository.CancelReservationAsync(id, reason);
        }

        public async Task<bool> ConfirmReservationAsync(int id, int adminUserId)
        {
            var reservation = await _reservationRepository.GetByIdAsync(id);
            if (reservation == null) return false;

            if (reservation.Status != "Pending")
            {
                throw new InvalidOperationException("Solo se pueden confirmar reservaciones pendientes");
            }

            reservation.Status = "Confirmed";
            reservation.UpdatedAt = DateTime.UtcNow;
            await _reservationRepository.UpdateAsync(reservation);

            _logger.LogInformation("Reservación confirmada: {ReservationId} por Admin: {AdminId}", id, adminUserId);
            return true;
        }

        public async Task<IEnumerable<ReservationResponseDto>> GetUpcomingReservationsAsync(int userId, int limit = 10)
        {
            var reservations = await _reservationRepository.GetUpcomingReservationsAsync(userId, limit);
            return _mapper.Map<IEnumerable<ReservationResponseDto>>(reservations);
        }

        public async Task<IEnumerable<ReservationResponseDto>> GetActiveReservationsAsync()
        {
            var reservations = await _reservationRepository.GetActiveReservationsAsync();
            return _mapper.Map<IEnumerable<ReservationResponseDto>>(reservations);
        }

        public async Task<ReservationSummaryDto> GetReservationSummaryAsync(int userId)
        {
            var reservations = await _reservationRepository.GetUserReservationsAsync(userId);
            var reservationList = reservations?.ToList() ?? new List<Reservation>();

            var summary = new ReservationSummaryDto
            {
                TotalReservations = reservationList.Count,
                ActiveReservations = reservationList.Count(r => r.Status == "Confirmed" && r.StartTime <= DateTime.UtcNow && r.EndTime >= DateTime.UtcNow),
                UpcomingReservations = reservationList.Count(r => r.Status == "Confirmed" && r.StartTime > DateTime.UtcNow),
                CompletedReservations = reservationList.Count(r => r.Status == "Completed"),
                CancelledReservations = reservationList.Count(r => r.Status == "Cancelled"),
                TotalSpent = reservationList.Where(r => r.Status == "Completed").Sum(r => r.TotalPrice),
                TotalHoursBooked = (int)reservationList.Where(r => r.Status == "Completed").Sum(r => (r.EndTime - r.StartTime).TotalHours)
            };

            if (summary.TotalReservations > 0)
            {
                summary.AverageSpentPerReservation = summary.TotalSpent / summary.TotalReservations;
            }

            return summary;
        }

        // ==================== MÉTODOS PRIVADOS AUXILIARES ====================

        private void ValidateReservationDates(DateTime startTime, DateTime endTime)
        {
            if (startTime >= endTime)
            {
                throw new InvalidOperationException("La fecha de inicio debe ser anterior a la fecha de fin");
            }

            var minStartTime = DateTime.UtcNow.AddMinutes(-1);
            if (startTime < minStartTime)
            {
                throw new InvalidOperationException("No se pueden hacer reservas en el pasado");
            }

            var maxDuration = TimeSpan.FromDays(30);
            if (endTime - startTime > maxDuration)
            {
                throw new InvalidOperationException($"La duración máxima de una reserva es de {maxDuration.Days} días");
            }

            var minDuration = TimeSpan.FromMinutes(30);
            if (endTime - startTime < minDuration)
            {
                throw new InvalidOperationException($"La duración mínima de una reserva es de {minDuration.Minutes} minutos");
            }
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
    }
}