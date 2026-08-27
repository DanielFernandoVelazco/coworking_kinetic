// backend/KineticWorkspace.API/Services/Interfaces/IAdminService.cs
using KineticWorkspace.API.Models.DTOs.Admin;
using KineticWorkspace.API.Models.DTOs.Alerts;

namespace KineticWorkspace.API.Services.Interfaces
{
    public interface IAdminService
    {
        // ========== MÉTODOS EXISTENTES ==========
        Task<AdminDashboardDto> GetDashboardDataAsync();
        Task<SummaryMetricsDto> GetSummaryMetricsAsync();
        Task<List<MonthlyMetricDto>> GetMonthlyReservationsAsync(int months = 12);
        Task<List<MonthlyMetricDto>> GetMonthlyRevenueAsync(int months = 12);
        Task<List<RecentReservationDto>> GetRecentReservationsAsync(int limit = 10);
        Task<List<TopUserDto>> GetTopUsersAsync(int limit = 10);
        Task<List<TopSpaceDto>> GetTopSpacesAsync(int limit = 10);
        Task<SystemHealthDto> GetSystemHealthAsync();
        Task<byte[]> ExportReportAsync(DateTime startDate, DateTime endDate);

        // ========== ✅ NUEVOS MÉTODOS DE ALERTAS ==========
        Task<IEnumerable<AlertResponseDto>> GetAllAlertsAsync(bool? isRead = null, int limit = 100);
        Task<AlertStatsDto> GetAlertStatsAsync();
        Task<int> BroadcastAlertAsync(AlertRequestDto request);
        Task<AlertResponseDto?> GetAlertByIdAsync(int id);
        Task<bool> DeleteAlertAsync(int id);
    }
}