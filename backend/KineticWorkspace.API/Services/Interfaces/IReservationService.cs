using KineticWorkspace.API.Models.DTOs.Reservations;

namespace KineticWorkspace.API.Services.Interfaces
{
    public interface IReservationService
    {
        Task<IEnumerable<ReservationResponseDto>> GetUserReservationsAsync(int userId);
        Task<IEnumerable<ReservationResponseDto>> GetSpaceReservationsAsync(int spaceId);
        Task<ReservationResponseDto?> GetReservationByIdAsync(int id);
        Task<ReservationResponseDto> CreateReservationAsync(ReservationRequestDto request, int userId);
        Task<ReservationResponseDto?> UpdateReservationAsync(int id, ReservationRequestDto request, int userId);
        Task<bool> CancelReservationAsync(int id, int userId, string reason);
        Task<bool> ConfirmReservationAsync(int id, int adminUserId);
        Task<IEnumerable<ReservationResponseDto>> GetUpcomingReservationsAsync(int userId, int limit = 10);
        Task<IEnumerable<ReservationResponseDto>> GetActiveReservationsAsync();
        Task<ReservationSummaryDto> GetReservationSummaryAsync(int userId);

        // Método con filtros y ordenamiento
        Task<PaginatedReservationResponseDto> GetUserReservationsFilteredAsync(
            int userId,
            int page,
            int pageSize,
            string? sortBy,
            string? status);


        // Obtiene todas las reservas con filtros (solo para administradores)

        Task<PaginatedReservationResponseDto> GetAllReservationsFilteredAsync(
            int page,
            int pageSize,
            string? sortBy,
            string? status,
            string? searchTerm,
            int? userId,
            int? spaceId);
    }
}