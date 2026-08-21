using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Repositories.Interfaces
{
    public interface IReservationRepository : IGenericRepository<Reservation>
    {
        Task<IEnumerable<Reservation>> GetUserReservationsAsync(int userId);
        Task<IEnumerable<Reservation>> GetSpaceReservationsAsync(int spaceId);
        Task<IEnumerable<Reservation>> GetReservationsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Reservation>> GetUpcomingReservationsAsync(int userId, int limit = 10);
        Task<IEnumerable<Reservation>> GetActiveReservationsAsync();
        Task<Reservation?> GetReservationWithDetailsAsync(int reservationId);
        Task<bool> CancelReservationAsync(int reservationId, string reason);
        Task<bool> CompleteReservationAsync(int reservationId);
        Task<IEnumerable<Reservation>> GetPendingReservationsAsync();
        Task<decimal> GetTotalRevenueByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<Dictionary<string, int>> GetReservationStatsByTypeAsync(DateTime startDate, DateTime endDate);
        Task<bool> IsSpaceReservedAsync(int spaceId, DateTime startTime, DateTime endTime, int? excludeReservationId = null);

        // Método con filtros y ordenamiento
        Task<(IEnumerable<Reservation> Items, int TotalCount)> GetUserReservationsFilteredAsync(
            int userId,
            int page,
            int pageSize,
            string? sortBy,
            string? status);

        // Obtener todas las reservas (para admin)
        Task<(IEnumerable<Reservation> Items, int TotalCount)> GetAllReservationsFilteredAsync(
            int page,
            int pageSize,
            string? sortBy,
            string? status,
            string? searchTerm,
            int? userId,
            int? spaceId);
    }
}