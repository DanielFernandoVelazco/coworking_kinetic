// backend/KineticWorkspace.API/Repositories/Implementations/AlertRepository.cs
using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;

namespace KineticWorkspace.API.Repositories.Implementations
{
    public class AlertRepository : GenericRepository<Alert>, IAlertRepository
    {
        public AlertRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Alert>> GetUserAlertsAsync(int userId, bool? isRead = null, int limit = 50)
        {
            var query = _dbSet
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt);

            if (isRead.HasValue)
            {
                query = (IOrderedQueryable<Alert>)query.Where(a => a.IsRead == isRead.Value);
            }

            return await query.Take(limit).ToListAsync();
        }

        public async Task<IEnumerable<Alert>> GetUnreadAlertsAsync(int userId)
        {
            return await _dbSet
                .Where(a => a.UserId == userId && !a.IsRead)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _dbSet
                .Where(a => a.UserId == userId && !a.IsRead)
                .CountAsync();
        }

        public async Task<bool> MarkAsReadAsync(int alertId, int userId)
        {
            var alert = await _dbSet
                .FirstOrDefaultAsync(a => a.Id == alertId && a.UserId == userId);

            if (alert == null || alert.IsRead) return false;

            alert.IsRead = true;
            alert.ReadAt = DateTime.UtcNow;
            await UpdateAsync(alert);
            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            var alerts = await _dbSet
                .Where(a => a.UserId == userId && !a.IsRead)
                .ToListAsync();

            if (!alerts.Any()) return false;

            foreach (var alert in alerts)
            {
                alert.IsRead = true;
                alert.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAlertAsync(int alertId, int userId)
        {
            var alert = await _dbSet
                .FirstOrDefaultAsync(a => a.Id == alertId && a.UserId == userId);

            if (alert == null) return false;

            _dbSet.Remove(alert);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAllReadAsync(int userId)
        {
            var alerts = await _dbSet
                .Where(a => a.UserId == userId && a.IsRead)
                .ToListAsync();

            if (!alerts.Any()) return false;

            _dbSet.RemoveRange(alerts);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Alert?> GetAlertByIdAsync(int alertId, int userId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(a => a.Id == alertId && a.UserId == userId);
        }

        public async Task<Alert> CreateAlertAsync(Alert alert)
        {
            await _dbSet.AddAsync(alert);
            await _context.SaveChangesAsync();
            return alert;
        }

        public async Task<int> CleanOldAlertsAsync(int daysOld = 30)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-daysOld);
            var oldAlerts = await _dbSet
                .Where(a => a.CreatedAt < cutoffDate && a.IsRead)
                .ToListAsync();

            if (!oldAlerts.Any()) return 0;

            _dbSet.RemoveRange(oldAlerts);
            await _context.SaveChangesAsync();
            return oldAlerts.Count;
        }
    }
}