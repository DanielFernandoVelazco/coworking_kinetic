// backend/KineticWorkspace.API/Models/DTOs/Admin/AdminDashboardDto.cs
namespace KineticWorkspace.API.Models.DTOs.Admin
{
    public class AdminDashboardDto
    {
        public SummaryMetricsDto Summary { get; set; } = new();
        public List<MonthlyMetricDto> MonthlyReservations { get; set; } = new();
        public List<MonthlyMetricDto> MonthlyRevenue { get; set; } = new();
        public List<RecentReservationDto> RecentReservations { get; set; } = new();
        public List<TopUserDto> TopUsers { get; set; } = new();
        public List<TopSpaceDto> TopSpaces { get; set; } = new();
        public List<SpaceStatusDto> SpaceStatus { get; set; } = new();
        public SystemHealthDto SystemHealth { get; set; } = new();
        public List<ReservationStatusDto> ReservationStatusDistribution { get; set; } = new();
        public List<SpaceTypeDistributionDto> SpaceTypeDistribution { get; set; } = new();
    }

    public class SummaryMetricsDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int NewUsersThisMonth { get; set; }
        public int TotalSpaces { get; set; }
        public int AvailableSpaces { get; set; }
        public int TotalReservations { get; set; }
        public int ActiveReservations { get; set; }
        public int PendingReservations { get; set; }
        public int CompletedReservations { get; set; }
        public int CancelledReservations { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public decimal AverageRevenuePerBooking { get; set; }
        public decimal OccupancyRate { get; set; }
    }

    public class MonthlyMetricDto
    {
        public string Month { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Amount { get; set; }
    }

    public class RecentReservationDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string SpaceName { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class TopUserDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int TotalReservations { get; set; }
        public decimal TotalSpent { get; set; }
        public DateTime LastActivity { get; set; }
    }

    public class TopSpaceDto
    {
        public int SpaceId { get; set; }
        public string SpaceName { get; set; } = string.Empty;
        public string SpaceType { get; set; } = string.Empty;
        public int TotalReservations { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalHoursBooked { get; set; }
        public double AverageRating { get; set; }
    }

    public class SpaceStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    public class SystemHealthDto
    {
        public bool DatabaseOk { get; set; }
        public bool ApiOk { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime LastCheck { get; set; }
        public int UptimeDays { get; set; }
        public int ActiveConnections { get; set; }
    }

    public class ReservationStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    public class SpaceTypeDistributionDto
    {
        public string Type { get; set; } = string.Empty;
        public int Count { get; set; }
        public string Color { get; set; } = string.Empty;
    }
}