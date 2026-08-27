// backend/KineticWorkspace.API/Models/DTOs/Alerts/AlertResponseDto.cs

namespace KineticWorkspace.API.Models.DTOs.Alerts
{
    public class AlertResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public string? ActionUrl { get; set; }
        public string? ActionLabel { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public string TimeAgo { get; set; } = string.Empty;

        // ✅ CAMPOS PARA ADMIN
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
    }

    public class AlertSummaryDto
    {
        public int Total { get; set; }
        public int Unread { get; set; }
        public int Read { get; set; }
        public Dictionary<string, int> ByType { get; set; } = new();
        public Dictionary<string, int> ByCategory { get; set; } = new();
    }
}