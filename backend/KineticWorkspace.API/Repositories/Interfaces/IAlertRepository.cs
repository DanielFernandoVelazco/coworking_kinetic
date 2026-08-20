// backend/KineticWorkspace.API/Repositories/Interfaces/IAlertRepository.cs
using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Repositories.Interfaces
{
    public interface IAlertRepository : IGenericRepository<Alert>
    {
        Task<IEnumerable<Alert>> GetUserAlertsAsync(int userId, bool? isRead = null, int limit = 50);
        Task<IEnumerable<Alert>> GetUnreadAlertsAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task<bool> MarkAsReadAsync(int alertId, int userId);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task<bool> DeleteAlertAsync(int alertId, int userId);
        Task<bool> DeleteAllReadAsync(int userId);
        Task<Alert?> GetAlertByIdAsync(int alertId, int userId);
        Task<Alert> CreateAlertAsync(Alert alert);
        Task<int> CleanOldAlertsAsync(int daysOld = 30);
    }
}