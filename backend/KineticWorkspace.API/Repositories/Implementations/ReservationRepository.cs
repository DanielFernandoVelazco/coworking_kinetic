using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;

namespace KineticWorkspace.API.Repositories.Implementations
{
    public class ReservationRepository : GenericRepository<Reservation>, IReservationRepository
    {
        public ReservationRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Reservation>> GetUserReservationsAsync(int userId)
        {
            return await _dbSet
                .Include(r => r.Space)
                .Include(r => r.Payments)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reservation>> GetSpaceReservationsAsync(int spaceId)
        {
            return await _dbSet
                .Include(r => r.User)
                .Where(r => r.SpaceId == spaceId)
                .OrderByDescending(r => r.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reservation>> GetReservationsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Include(r => r.Space)
                .Include(r => r.User)
                .Where(r => r.StartTime >= startDate && r.EndTime <= endDate)
                .OrderBy(r => r.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reservation>> GetUpcomingReservationsAsync(int userId, int limit = 10)
        {
            var now = DateTime.UtcNow;
            return await _dbSet
                .Include(r => r.Space)
                .Where(r => r.UserId == userId && r.StartTime >= now && r.Status != "Cancelled")
                .OrderBy(r => r.StartTime)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reservation>> GetActiveReservationsAsync()
        {
            var now = DateTime.UtcNow;
            return await _dbSet
                .Include(r => r.Space)
                .Include(r => r.User)
                .Where(r => r.StartTime <= now && r.EndTime >= now && r.Status == "Confirmed")
                .OrderBy(r => r.StartTime)
                .ToListAsync();
        }

        public async Task<Reservation?> GetReservationWithDetailsAsync(int reservationId)
        {
            return await _dbSet
                .Include(r => r.Space)
                .Include(r => r.User)
                .Include(r => r.Payments)
                .FirstOrDefaultAsync(r => r.Id == reservationId);
        }

        public async Task<bool> CancelReservationAsync(int reservationId, string reason)
        {
            var reservation = await GetByIdAsync(reservationId);
            if (reservation == null || reservation.Status == "Cancelled" || reservation.Status == "Completed")
                return false;

            reservation.Status = "Cancelled";
            reservation.CancelledAt = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(reason))
            {
                reservation.Notes = $"{reservation.Notes}\nCancelado: {reason}";
            }
            await UpdateAsync(reservation);
            return true;
        }

        public async Task<bool> CompleteReservationAsync(int reservationId)
        {
            var reservation = await GetByIdAsync(reservationId);
            if (reservation == null || reservation.Status == "Cancelled")
                return false;

            reservation.Status = "Completed";
            reservation.CompletedAt = DateTime.UtcNow;
            await UpdateAsync(reservation);
            return true;
        }

        public async Task<IEnumerable<Reservation>> GetPendingReservationsAsync()
        {
            return await _dbSet
                .Include(r => r.Space)
                .Include(r => r.User)
                .Where(r => r.Status == "Pending")
                .OrderBy(r => r.StartTime)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalRevenueByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Where(r => r.Status == "Completed" && r.StartTime >= startDate && r.EndTime <= endDate)
                .SumAsync(r => r.TotalPrice);
        }

        public async Task<Dictionary<string, int>> GetReservationStatsByTypeAsync(DateTime startDate, DateTime endDate)
        {
            var stats = await _dbSet
                .Include(r => r.Space)
                .Where(r => r.StartTime >= startDate && r.EndTime <= endDate)
                .GroupBy(r => r.Space.Type)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .ToListAsync();

            return stats.ToDictionary(x => x.Type, x => x.Count);
        }

        public async Task<bool> IsSpaceReservedAsync(int spaceId, DateTime startTime, DateTime endTime, int? excludeReservationId = null)
        {
            var query = _dbSet
                .Where(r => r.SpaceId == spaceId &&
                           r.Status != "Cancelled" &&
                           r.Status != "Completed" &&
                           ((startTime >= r.StartTime && startTime < r.EndTime) ||
                            (endTime > r.StartTime && endTime <= r.EndTime) ||
                            (startTime <= r.StartTime && endTime >= r.EndTime)));

            if (excludeReservationId.HasValue)
            {
                query = query.Where(r => r.Id != excludeReservationId.Value);
            }

            return await query.AnyAsync();
        }
    }
}