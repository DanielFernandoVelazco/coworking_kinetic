// backend/KineticWorkspace.API/Models/Entities/Alert.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KineticWorkspace.API.Models.Entities
{
    public class Alert
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = "info"; // "info", "success", "warning", "error"

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = "general"; // "booking", "payment", "system", "promotion"

        [Required]
        public bool IsRead { get; set; } = false;

        public string? ActionUrl { get; set; } // URL para acción (ej: /reservations/123)
        public string? ActionLabel { get; set; } // Texto del botón de acción

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}