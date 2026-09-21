using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.DTOs.PreReservations;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Services.Implementations.Payments
{
    public class PaymentProcessorService : IPaymentProcessorService
    {
        private readonly ApplicationDbContext _context;
        private readonly IInvoiceService _invoiceService;
        private readonly ILogger<PaymentProcessorService> _logger;

        public PaymentProcessorService(
            ApplicationDbContext context,
            IInvoiceService invoiceService,
            ILogger<PaymentProcessorService> logger)
        {
            _context = context;
            _invoiceService = invoiceService;
            _logger = logger;
        }

        public async Task<PreReservationConfirmResponseDto> ConfirmPaymentAsync(
            PreReservationConfirmRequestDto request,
            int userId)
        {
            _logger.LogInformation(
                "Confirmando pago para PreReservationId: {PreReservationId}, UserId: {UserId}",
                request.PreReservationId, userId);

            var preReservation = await _context.PreReservations
                .Include(pr => pr.User)
                .Include(pr => pr.Space)
                .FirstOrDefaultAsync(pr => pr.Id == request.PreReservationId && pr.UserId == userId);

            if (preReservation == null)
            {
                _logger.LogWarning("Pre-reserva no encontrada: {PreReservationId}", request.PreReservationId);
                throw new InvalidOperationException("Pre-reserva no encontrada");
            }

            _logger.LogInformation(
                "Pre-reserva encontrada: Status={Status}, PaymentIntentId={PaymentIntentId}",
                preReservation.Status, preReservation.PaymentIntentId);

            if (preReservation.Status != "PaymentPending")
            {
                _logger.LogWarning("Estado incorrecto: {Status}", preReservation.Status);
                throw new InvalidOperationException(
                    $"La pre-reserva no está en estado de pago pendiente. Estado actual: {preReservation.Status}");
            }

            if (preReservation.PaymentIntentId != request.PaymentIntentId)
            {
                _logger.LogWarning(
                    "PaymentIntentId no coincide. Esperado: {Expected}, Recibido: {Received}",
                    preReservation.PaymentIntentId, request.PaymentIntentId);
                throw new InvalidOperationException("El PaymentIntentId no coincide");
            }

            if (preReservation.ExpiresAt.HasValue && DateTime.UtcNow >= preReservation.ExpiresAt.Value)
            {
                preReservation.Status = "Expired";
                await _context.SaveChangesAsync();
                _logger.LogWarning("Pre-reserva expirada: {PreReservationId}", request.PreReservationId);
                throw new InvalidOperationException("La pre-reserva ha expirado");
            }

            var transactionId = $"txn_{Guid.NewGuid():N}";

            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
{
    await using var transaction = await _context.Database.BeginTransactionAsync();

    try
    {
        // ✅ FIX C1: Verificar disponibilidad ANTES de crear la reserva.
        // Es un chequeo defensivo contra doble booking entre la creación
        // de la pre-reserva y la confirmación del pago (hasta 30 min de ventana).
        var hasOverlap = await _context.Reservations
            .AnyAsync(r => r.SpaceId == preReservation.SpaceId
                        && r.Status != "Cancelled"
                        && r.Status != "Completed"
                        && r.StartTime < preReservation.EndTime
                        && r.EndTime > preReservation.StartTime);

        if (hasOverlap)
        {
            _logger.LogWarning(
                "Doble booking detectado para PreReservation {PreReservationId}. " +
                "Espacio {SpaceId} ya reservado en el rango.",
                preReservation.Id, preReservation.SpaceId);

            preReservation.Status = "Cancelled";
            preReservation.CancellationReason = "El espacio fue reservado por otro usuario durante el proceso de pago";
            preReservation.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            throw new InvalidOperationException(
                "El espacio ya no está disponible. La pre-reserva ha sido cancelada. " +
                "Por favor, elige otro horario o espacio.");
        }

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

        // ✅ Necesitamos el reservation.Id para la factura y el pago,
        // así que forzamos un SaveChanges AQUÍ. Es el único punto donde
        // necesitamos el ID generado por la BD antes de continuar.
        await _context.SaveChangesAsync();
        _logger.LogInformation("Reserva creada: {ReservationId}", reservation.Id);

        // 2. Crear la factura (SIN SaveChanges interno — solo AddAsync)
        var invoice = await _invoiceService.CreateInvoiceAsync(
            preReservation.UserId,
            reservation.Id,
            preReservation.TotalPrice,
            preReservation.PaymentMethod ?? "CreditCard",
            transactionId);
        _logger.LogInformation("Factura preparada: {InvoiceNumber}", invoice.InvoiceNumber);

        // Marcar factura como pagada (SIN SaveChanges interno — solo modifica entidad en contexto)
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

        // 4. Actualizar pre-reserva
        preReservation.Status = "Paid";
        preReservation.PaidAmount = preReservation.TotalPrice;
        preReservation.PaidAt = DateTime.UtcNow;
        preReservation.TransactionId = transactionId;
        preReservation.UpdatedAt = DateTime.UtcNow;

        // ✅ FIX: un ÚNICO SaveChanges para factura + pago + pre-reserva.
        // Todo se persiste atómicamente o nada.
        await _context.SaveChangesAsync();

        _logger.LogInformation("Pago creado: {PaymentId}", payment.Id);

        await transaction.CommitAsync();

        _logger.LogInformation(
            "✅ Pago completado exitosamente. Reserva: {ReservationId}, Factura: {InvoiceNumber}",
            reservation.Id, invoice.InvoiceNumber);

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
        _logger.LogError(ex,
            "Error al confirmar pago para PreReservationId: {PreReservationId}",
            request.PreReservationId);
        throw;
    }
});
        }
    }
}