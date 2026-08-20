// backend/KineticWorkspace.API/Models/DTOs/Alerts/AlertRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace KineticWorkspace.API.Models.DTOs.Alerts
{
    public class AlertRequestDto
    {
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Type { get; set; } = "info";

        [MaxLength(50)]
        public string Category { get; set; } = "general";

        public string? ActionUrl { get; set; }
        public string? ActionLabel { get; set; }
    }

    public class AlertCreateDto
    {
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "info";
        public string Category { get; set; } = "general";
        public string? ActionUrl { get; set; }
        public string? ActionLabel { get; set; }
    }

    public class AlertMarkReadDto
    {
        public int AlertId { get; set; }
        public bool IsRead { get; set; } = true;
    }

    public class AlertMarkAllReadDto
    {
        public bool AllRead { get; set; } = true;
    }
}