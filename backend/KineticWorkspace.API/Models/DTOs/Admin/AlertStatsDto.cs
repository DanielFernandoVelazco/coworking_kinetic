// backend/KineticWorkspace.API/Models/DTOs/Admin/AlertStatsDto.cs

namespace KineticWorkspace.API.Models.DTOs.Admin
{
    public class AlertStatsDto
    {
        public int Total { get; set; }
        public int Unread { get; set; }
        public int Read { get; set; }
        public int Last7Days { get; set; }
        public Dictionary<string, int> ByType { get; set; } = new();
        public Dictionary<string, int> ByCategory { get; set; } = new();
        public List<DailyAlertCount> DailyTrend { get; set; } = new();
    }

    public class DailyAlertCount
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
    }
}