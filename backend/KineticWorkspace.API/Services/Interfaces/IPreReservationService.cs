// backend/KineticWorkspace.API/Services/Interfaces/IPreReservationService.cs
using KineticWorkspace.API.Models.DTOs.PreReservations;

namespace KineticWorkspace.API.Services.Interfaces
{
    public interface IPreReservationService
    {
        // Crear una pre-reserva (carrito)
        Task<PreReservationResponseDto> CreatePreReservationAsync(PreReservationRequestDto request, int userId);

        // Obtener pre-reserva por ID
        Task<PreReservationResponseDto?> GetPreReservationByIdAsync(int id, int userId);

        // Obtener pre-reservas del usuario (carrito activo)
        Task<IEnumerable<PreReservationResponseDto>> GetUserPreReservationsAsync(int userId, string? status = null);

        // Procesar pago de pre-reserva
        Task<PreReservationPaymentResponseDto> ProcessPaymentAsync(PreReservationPaymentRequestDto request, int userId);

        // Confirmar pago y convertir a reserva definitiva
        Task<PreReservationConfirmResponseDto> ConfirmPaymentAsync(PreReservationConfirmRequestDto request, int userId);

        // Cancelar pre-reserva
        Task<bool> CancelPreReservationAsync(int id, int userId, string? reason = null);

        // Limpiar pre-reservas expiradas (tarea programada)
        Task<int> CleanExpiredPreReservationsAsync();

        // Obtener carrito activo por sessionId
        Task<PreReservationResponseDto?> GetActiveCartBySessionIdAsync(string sessionId, int userId);
    }
}