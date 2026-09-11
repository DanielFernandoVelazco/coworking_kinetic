using KineticWorkspace.API.Models.DTOs.Admin;

namespace KineticWorkspace.API.Services.Interfaces.Admin
{
    public interface IAdminDashboardService
    {
        Task<AdminDashboardDto> GetDashboardDataAsync();
        Task<SummaryMetricsDto> GetSummaryMetricsAsync();
        Task<List<MonthlyMetricDto>> GetMonthlyReservationsAsync(int months = 12);
        Task<List<MonthlyMetricDto>> GetMonthlyRevenueAsync(int months = 12);
        Task<List<RecentReservationDto>> GetRecentReservationsAsync(int limit = 10);
        Task<List<TopUserDto>> GetTopUsersAsync(int limit = 10);
        Task<List<TopSpaceDto>> GetTopSpacesAsync(int limit = 10);
        Task<SystemHealthDto> GetSystemHealthAsync();
    }
}