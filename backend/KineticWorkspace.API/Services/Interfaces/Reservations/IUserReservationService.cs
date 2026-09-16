using KineticWorkspace.API.Models.DTOs.Reservations;

namespace KineticWorkspace.API.Services.Interfaces.Reservations
{
    /// <summary>
    /// Operaciones que un usuario autenticado puede hacer sobre sus propias reservas.
    /// </summary>
    public interface IUserReservationService
    {
        Task<IEnumerable<ReservationResponseDto>> GetUserReservationsAsync(int userId);
        Task<IEnumerable<ReservationResponseDto>> GetUpcomingReservationsAsync(int userId, int limit = 10);
        Task<ReservationSummaryDto> GetReservationSummaryAsync(int userId);
        Task<ReservationResponseDto?> GetReservationByIdAsync(int id);
        Task<IEnumerable<ReservationResponseDto>> GetSpaceReservationsAsync(int spaceId);
        Task<ReservationResponseDto> CreateReservationAsync(ReservationRequestDto request, int userId);
        Task<ReservationResponseDto?> UpdateReservationAsync(int id, ReservationRequestDto request, int userId, bool isAdmin = false);
        Task<bool> CancelReservationAsync(int id, int userId, string reason, bool isAdmin = false);

        Task<PaginatedReservationResponseDto> GetUserReservationsFilteredAsync(
            int userId, int page, int pageSize, string? sortBy, string? status);
    }
}