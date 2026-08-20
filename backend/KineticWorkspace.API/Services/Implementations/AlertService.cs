// backend/KineticWorkspace.API/Services/Implementations/AlertService.cs
using AutoMapper;
using KineticWorkspace.API.Models.DTOs.Alerts;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Services.Implementations
{
    public class AlertService : IAlertService
    {
        private readonly IAlertRepository _alertRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<AlertService> _logger;

        public AlertService(
            IAlertRepository alertRepository,
            IMapper mapper,
            ILogger<AlertService> logger)
        {
            _alertRepository = alertRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<AlertResponseDto>> GetUserAlertsAsync(int userId, bool? isRead = null, int limit = 50)
        {
            var alerts = await _alertRepository.GetUserAlertsAsync(userId, isRead, limit);
            return alerts.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<AlertResponseDto>> GetUnreadAlertsAsync(int userId)
        {
            var alerts = await _alertRepository.GetUnreadAlertsAsync(userId);
            return alerts.Select(MapToResponseDto);
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _alertRepository.GetUnreadCountAsync(userId);
        }

        public async Task<AlertResponseDto?> GetAlertByIdAsync(int alertId, int userId)
        {
            var alert = await _alertRepository.GetAlertByIdAsync(alertId, userId);
            return alert != null ? MapToResponseDto(alert) : null;
        }

        public async Task<AlertResponseDto> CreateAlertAsync(int userId, AlertRequestDto request)
        {
            var alert = new Alert
            {
                UserId = userId,
                Title = request.Title,
                Message = request.Message,
                Type = request.Type,
                Category = request.Category,
                ActionUrl = request.ActionUrl,
                ActionLabel = request.ActionLabel,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _alertRepository.CreateAlertAsync(alert);
            _logger.LogInformation("Alerta creada para usuario {UserId}: {Title}", userId, alert.Title);
            return MapToResponseDto(created);
        }

        public async Task<AlertResponseDto> CreateAlertAsync(int userId, string title, string message, string type = "info", string category = "general", string? actionUrl = null, string? actionLabel = null)
        {
            var request = new AlertRequestDto
            {
                Title = title,
                Message = message,
                Type = type,
                Category = category,
                ActionUrl = actionUrl,
                ActionLabel = actionLabel
            };
            return await CreateAlertAsync(userId, request);
        }

        public async Task<bool> MarkAsReadAsync(int alertId, int userId)
        {
            return await _alertRepository.MarkAsReadAsync(alertId, userId);
        }

        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            return await _alertRepository.MarkAllAsReadAsync(userId);
        }

        public async Task<bool> DeleteAlertAsync(int alertId, int userId)
        {
            return await _alertRepository.DeleteAlertAsync(alertId, userId);
        }

        public async Task<bool> DeleteAllReadAsync(int userId)
        {
            return await _alertRepository.DeleteAllReadAsync(userId);
        }

        public async Task<AlertSummaryDto> GetAlertSummaryAsync(int userId)
        {
            var alerts = await _alertRepository.GetUserAlertsAsync(userId, null, 1000);
            var alertList = alerts.ToList();

            return new AlertSummaryDto
            {
                Total = alertList.Count,
                Unread = alertList.Count(a => !a.IsRead),
                Read = alertList.Count(a => a.IsRead),
                ByType = alertList.GroupBy(a => a.Type).ToDictionary(g => g.Key, g => g.Count()),
                ByCategory = alertList.GroupBy(a => a.Category).ToDictionary(g => g.Key, g => g.Count())
            };
        }

        public async Task<int> CleanOldAlertsAsync(int daysOld = 30)
        {
            return await _alertRepository.CleanOldAlertsAsync(daysOld);
        }

        private AlertResponseDto MapToResponseDto(Alert alert)
        {
            var timeAgo = GetTimeAgo(alert.CreatedAt);

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
                TimeAgo = timeAgo
            };
        }

        private string GetTimeAgo(DateTime dateTime)
        {
            var diff = DateTime.UtcNow - dateTime;

            if (diff.TotalMinutes < 1) return "Just now";
            if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes}m ago";
            if (diff.TotalHours < 24) return $"{(int)diff.TotalHours}h ago";
            if (diff.TotalDays < 7) return $"{(int)diff.TotalDays}d ago";
            if (diff.TotalDays < 30) return $"{(int)(diff.TotalDays / 7)}w ago";
            if (diff.TotalDays < 365) return $"{(int)(diff.TotalDays / 30)}mo ago";
            return $"{(int)(diff.TotalDays / 365)}y ago";
        }
    }
}