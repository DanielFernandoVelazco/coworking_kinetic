// backend/KineticWorkspace.API/Services/Interfaces/IAlertService.cs
using KineticWorkspace.API.Models.DTOs.Alerts;

namespace KineticWorkspace.API.Services.Interfaces
{
    public interface IAlertService
    {
        Task<IEnumerable<AlertResponseDto>> GetUserAlertsAsync(int userId, bool? isRead = null, int limit = 50);
        Task<IEnumerable<AlertResponseDto>> GetUnreadAlertsAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task<AlertResponseDto?> GetAlertByIdAsync(int alertId, int userId);
        Task<AlertResponseDto> CreateAlertAsync(int userId, AlertRequestDto request);
        Task<AlertResponseDto> CreateAlertAsync(int userId, string title, string message, string type = "info", string category = "general", string? actionUrl = null, string? actionLabel = null);
        Task<bool> MarkAsReadAsync(int alertId, int userId);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task<bool> DeleteAlertAsync(int alertId, int userId);
        Task<bool> DeleteAllReadAsync(int userId);
        Task<AlertSummaryDto> GetAlertSummaryAsync(int userId);
        Task<int> CleanOldAlertsAsync(int daysOld = 30);
    }
}