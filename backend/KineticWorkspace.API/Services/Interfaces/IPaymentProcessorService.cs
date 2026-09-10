using KineticWorkspace.API.Models.DTOs.PreReservations;

namespace KineticWorkspace.API.Services.Interfaces
{
    public interface IPaymentProcessorService
    {
        /// <summary>
        /// Confirma el pago de una pre-reserva y la convierte en:
        /// - Reserva definitiva (Confirmed)
        /// - Factura (Paid)
        /// - Pago (Completed)
        /// Todo dentro de una transacción atómica.
        /// </summary>
        Task<PreReservationConfirmResponseDto> ConfirmPaymentAsync(
            PreReservationConfirmRequestDto request,
            int userId);
    }
}