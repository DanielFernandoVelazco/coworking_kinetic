// backend/KineticWorkspace.API/Models/Entities/PreReservation.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KineticWorkspace.API.Models.Entities
{
    public class PreReservation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int SpaceId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // "Pending", "PaymentPending", "Paid", "Cancelled", "Expired"

        [MaxLength(500)]
        public string? Notes { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        public int? NumberOfGuests { get; set; }

        // Información de pago
        [MaxLength(50)]
        public string? PaymentMethod { get; set; } // "CreditCard", "PayPal", "BankTransfer"

        [MaxLength(100)]
        public string? TransactionId { get; set; }

        [MaxLength(500)]
        public string? PaymentIntentId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? PaidAmount { get; set; }

        // Fechas
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; } // La pre-reserva expira después de 30 minutos
        public DateTime? PaidAt { get; set; }
        public DateTime? CancelledAt { get; set; }

        [MaxLength(500)]
        public string? CancellationReason { get; set; }

        // Session ID para carrito persistente
        [MaxLength(255)]
        public string? SessionId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("SpaceId")]
        public virtual Space Space { get; set; } = null!;

        // Propiedades calculadas
        [NotMapped]
        public bool IsExpired => ExpiresAt.HasValue && DateTime.UtcNow >= ExpiresAt.Value;

        [NotMapped]
        public bool IsPending => Status == "Pending" || Status == "PaymentPending";

        [NotMapped]
        public bool IsPaid => Status == "Paid";
    }
}