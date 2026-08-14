// backend/KineticWorkspace.API/Models/Entities/Invoice.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KineticWorkspace.API.Models.Entities
{
    public class Invoice
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string InvoiceNumber { get; set; } = string.Empty; // Formato: INV-2024-0001

        [Required]
        public int UserId { get; set; }

        [Required]
        public int ReservationId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // "Pending", "Paid", "Cancelled", "Refunded"

        // Detalles de la factura
        [MaxLength(50)]
        public string? PaymentMethod { get; set; }

        [MaxLength(100)]
        public string? TransactionId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? TaxAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? DiscountAmount { get; set; }

        // Fechas
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }
        public DateTime? DueDate { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        // Billing address
        [MaxLength(255)]
        public string? BillingAddress { get; set; }

        [MaxLength(100)]
        public string? BillingCity { get; set; }

        [MaxLength(50)]
        public string? BillingPostalCode { get; set; }

        [MaxLength(100)]
        public string? BillingCountry { get; set; }

        [MaxLength(50)]
        public string? BillingVatNumber { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("ReservationId")]
        public virtual Reservation Reservation { get; set; } = null!;

        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}