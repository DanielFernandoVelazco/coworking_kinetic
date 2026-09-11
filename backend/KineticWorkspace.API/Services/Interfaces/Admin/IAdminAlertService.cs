using KineticWorkspace.API.Models.DTOs.Admin;
using KineticWorkspace.API.Models.DTOs.Alerts;

namespace KineticWorkspace.API.Services.Interfaces.Admin
{
    public interface IAdminAlertService
    {
        Task<IEnumerable<AlertResponseDto>> GetAllAlertsAsync(bool? isRead = null, int limit = 100);
        Task<AlertStatsDto> GetAlertStatsAsync();
        Task<int> BroadcastAlertAsync(AlertRequestDto request);
        Task<AlertResponseDto?> GetAlertByIdAsync(int id);
        Task<bool> DeleteAlertAsync(int id);
    }
}