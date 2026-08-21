// backend/KineticWorkspace.API/Services/Interfaces/IReservationService.cs
using KineticWorkspace.API.Models.DTOs.Reservations;

namespace KineticWorkspace.API.Services.Interfaces
{
    public interface IReservationService
    {
        Task<IEnumerable<ReservationResponseDto>> GetUserReservationsAsync(int userId);
        Task<IEnumerable<ReservationResponseDto>> GetSpaceReservationsAsync(int spaceId);
        Task<ReservationResponseDto?> GetReservationByIdAsync(int id);
        Task<ReservationResponseDto> CreateReservationAsync(ReservationRequestDto request, int userId);

        // Incluye isAdmin como parámetro opcional
        Task<ReservationResponseDto?> UpdateReservationAsync(int id, ReservationRequestDto request, int userId, bool isAdmin = false);

        // Incluye isAdmin como parámetro opcional
        Task<bool> CancelReservationAsync(int id, int userId, string reason, bool isAdmin = false);

        Task<bool> ConfirmReservationAsync(int id, int adminUserId);
        Task<IEnumerable<ReservationResponseDto>> GetUpcomingReservationsAsync(int userId, int limit = 10);
        Task<IEnumerable<ReservationResponseDto>> GetActiveReservationsAsync();
        Task<ReservationSummaryDto> GetReservationSummaryAsync(int userId);

        // Método con filtros y ordenamiento (para usuarios)
        Task<PaginatedReservationResponseDto> GetUserReservationsFilteredAsync(
            int userId,
            int page,
            int pageSize,
            string? sortBy,
            string? status);

        // Método para administradores (todas las reservas)
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