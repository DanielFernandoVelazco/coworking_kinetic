using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Helpers.Formatting;
using KineticWorkspace.API.Models.DTOs.Admin;
using KineticWorkspace.API.Models.DTOs.Alerts;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Services.Interfaces.Admin;

namespace KineticWorkspace.API.Services.Implementations.Admin
{
    public class AdminAlertService : IAdminAlertService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminAlertService> _logger;
        private readonly ITimeAgoFormatter _timeAgoFormatter;

        public AdminAlertService(
            ApplicationDbContext context,
            ILogger<AdminAlertService> logger,
            ITimeAgoFormatter timeAgoFormatter)
        {
            _context = context;
            _logger = logger;
            _timeAgoFormatter = timeAgoFormatter;
        }

        public async Task<IEnumerable<AlertResponseDto>> GetAllAlertsAsync(bool? isRead = null, int limit = 100)
        {
            var query = _context.Alerts
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .AsQueryable();

            if (isRead.HasValue)
            {
                query = query.Where(a => a.IsRead == isRead.Value);
            }

            var alerts = await query.Take(limit).ToListAsync();

            return alerts.Select(a => new AlertResponseDto
            {
                Id = a.Id,
                UserId = a.UserId,
                Title = a.Title,
                Message = a.Message,
                Type = a.Type,
                Category = a.Category,
                IsRead = a.IsRead,
                ActionUrl = a.ActionUrl,
                ActionLabel = a.ActionLabel,
                CreatedAt = a.CreatedAt,
                ReadAt = a.ReadAt,
                UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : "Unknown",
                UserEmail = a.User?.Email ?? "unknown@email.com",
                TimeAgo = _timeAgoFormatter.Format(a.CreatedAt)
            });
        }

        public async Task<AlertStatsDto> GetAlertStatsAsync()
        {
            var total = await _context.Alerts.CountAsync();
            var unread = await _context.Alerts.CountAsync(a => !a.IsRead);
            var read = await _context.Alerts.CountAsync(a => a.IsRead);

            var byType = await _context.Alerts
                .GroupBy(a => a.Type)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.Type, g => g.Count);

            var byCategory = await _context.Alerts
                .GroupBy(a => a.Category)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.Category, g => g.Count);

            var last7Days = await _context.Alerts
                .Where(a => a.CreatedAt >= DateTime.UtcNow.AddDays(-7))
                .CountAsync();

            var dailyTrend = new List<DailyAlertCount>();
            for (int i = 6; i >= 0; i--)
            {
                var date = DateTime.UtcNow.AddDays(-i).Date;
                var count = await _context.Alerts
                    .Where(a => a.CreatedAt.Date == date)
                    .CountAsync();
                dailyTrend.Add(new DailyAlertCount
                {
                    Date = date,
                    Count = count
                });
            }

            return new AlertStatsDto
            {
                Total = total,
                Unread = unread,
                Read = read,
                ByType = byType,
                ByCategory = byCategory,
                Last7Days = last7Days,
                DailyTrend = dailyTrend
            };
        }

        public async Task<int> BroadcastAlertAsync(AlertRequestDto request)
        {
            var users = await _context.Users
                .Where(u => u.IsActive && u.DeletedAt == null)
                .ToListAsync();

            var alerts = new List<Alert>();
            foreach (var user in users)
            {
                alerts.Add(new Alert
                {
                    UserId = user.Id,
                    Title = request.Title,
                    Message = request.Message,
                    Type = request.Type,
                    Category = request.Category,
                    ActionUrl = request.ActionUrl,
                    ActionLabel = request.ActionLabel,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.Alerts.AddRangeAsync(alerts);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Alerta masiva enviada a {Count} usuarios: {Title}",
                users.Count, request.Title);

            return users.Count;
        }

        public async Task<AlertResponseDto?> GetAlertByIdAsync(int id)
        {
            var alert = await _context.Alerts
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (alert == null) return null;

            return new AlertResponseDto
            {
                Id = alert.Id,
                UserId = alert.UserId,
                Title = alert.Title,
                Message = alert.Message,
                Type = alert.Type,
                Category = alert.Category,
                IsRead = alert.IsRead,
                ActionUrl = alert.ActionUrl,
                ActionLabel = alert.ActionLabel,
                CreatedAt = alert.CreatedAt,
                ReadAt = alert.ReadAt,
                UserName = alert.User != null ? $"{alert.User.FirstName} {alert.User.LastName}" : "Unknown",
                UserEmail = alert.User?.Email ?? "unknown@email.com",
                TimeAgo = _timeAgoFormatter.Format(alert.CreatedAt)
            };
        }

        public async Task<bool> DeleteAlertAsync(int id)
        {
            var alert = await _context.Alerts.FindAsync(id);
            if (alert == null) return false;

            _context.Alerts.Remove(alert);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}