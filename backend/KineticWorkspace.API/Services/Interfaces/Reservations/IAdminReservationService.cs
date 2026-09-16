using KineticWorkspace.API.Models.DTOs.Reservations;

namespace KineticWorkspace.API.Services.Interfaces.Reservations
{
    /// <summary>
    /// Operaciones administrativas sobre reservas.
    /// </summary>
    public interface IAdminReservationService
    {
        Task<IEnumerable<ReservationResponseDto>> GetActiveReservationsAsync();
        Task<bool> ConfirmReservationAsync(int id, int adminUserId);

        Task<PaginatedReservationResponseDto> GetAllReservationsFilteredAsync(
            int page, int pageSize, string? sortBy, string? status,
            string? searchTerm, int? userId, int? spaceId);
    }
}