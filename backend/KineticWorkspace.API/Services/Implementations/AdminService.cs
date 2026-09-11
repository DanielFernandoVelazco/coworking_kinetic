using KineticWorkspace.API.Models.DTOs.Admin;
using KineticWorkspace.API.Models.DTOs.Alerts;
using KineticWorkspace.API.Services.Interfaces;
using KineticWorkspace.API.Services.Interfaces.Admin;

namespace KineticWorkspace.API.Services.Implementations
{
    /// <summary>
    /// Fachada que delega a servicios especializados.
    /// Se mantiene para no romper AdminController (que inyecta IAdminService).
    /// </summary>
    public class AdminService : IAdminService
    {
        private readonly IAdminDashboardService _dashboardService;
        private readonly IAdminReportService _reportService;
        private readonly IAdminAlertService _alertService;

        public AdminService(
            IAdminDashboardService dashboardService,
            IAdminReportService reportService,
            IAdminAlertService alertService)
        {
            _dashboardService = dashboardService;
            _reportService = reportService;
            _alertService = alertService;
        }

        // ========== DASHBOARD ==========
        public Task<AdminDashboardDto> GetDashboardDataAsync()
            => _dashboardService.GetDashboardDataAsync();

        public Task<SummaryMetricsDto> GetSummaryMetricsAsync()
            => _dashboardService.GetSummaryMetricsAsync();

        public Task<List<MonthlyMetricDto>> GetMonthlyReservationsAsync(int months = 12)
            => _dashboardService.GetMonthlyReservationsAsync(months);

        public Task<List<MonthlyMetricDto>> GetMonthlyRevenueAsync(int months = 12)
            => _dashboardService.GetMonthlyRevenueAsync(months);

        public Task<List<RecentReservationDto>> GetRecentReservationsAsync(int limit = 10)
            => _dashboardService.GetRecentReservationsAsync(limit);

        public Task<List<TopUserDto>> GetTopUsersAsync(int limit = 10)
            => _dashboardService.GetTopUsersAsync(limit);

        public Task<List<TopSpaceDto>> GetTopSpacesAsync(int limit = 10)
            => _dashboardService.GetTopSpacesAsync(limit);

        public Task<SystemHealthDto> GetSystemHealthAsync()
            => _dashboardService.GetSystemHealthAsync();

        // ========== REPORTES ==========
        public Task<byte[]> ExportReportAsync(DateTime startDate, DateTime endDate)
            => _reportService.ExportReportAsync(startDate, endDate);

        // ========== ALERTAS ADMIN ==========
        public Task<IEnumerable<AlertResponseDto>> GetAllAlertsAsync(bool? isRead = null, int limit = 100)
            => _alertService.GetAllAlertsAsync(isRead, limit);

        public Task<AlertStatsDto> GetAlertStatsAsync()
            => _alertService.GetAlertStatsAsync();

        public Task<int> BroadcastAlertAsync(AlertRequestDto request)
            => _alertService.BroadcastAlertAsync(request);

        public Task<AlertResponseDto?> GetAlertByIdAsync(int id)
            => _alertService.GetAlertByIdAsync(id);

        public Task<bool> DeleteAlertAsync(int id)
            => _alertService.DeleteAlertAsync(id);
    }
}