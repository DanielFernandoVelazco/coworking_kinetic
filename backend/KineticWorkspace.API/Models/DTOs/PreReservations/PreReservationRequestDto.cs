// backend/KineticWorkspace.API/Models/DTOs/PreReservations/PreReservationRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace KineticWorkspace.API.Models.DTOs.PreReservations
{
    public class PreReservationRequestDto
    {
        [Required]
        public int SpaceId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        public int? NumberOfGuests { get; set; }

        [MaxLength(50)]
        public string? SessionId { get; set; }
    }

    public class PreReservationPaymentRequestDto
    {
        [Required]
        public int PreReservationId { get; set; }

        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = string.Empty; // "CreditCard", "PayPal", "BankTransfer"

        // Para tarjetas de crédito (simulación)
        public string? CardNumber { get; set; }
        public string? CardExpiry { get; set; }
        public string? CardCvv { get; set; }

        // Para PayPal (simulación)
        public string? PayPalEmail { get; set; }

        // Billing information
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
    }

    public class PreReservationConfirmRequestDto
    {
        [Required]
        public int PreReservationId { get; set; }

        [Required]
        public string PaymentIntentId { get; set; } = string.Empty;
    }
}