// backend/KineticWorkspace.API/Models/DTOs/PreReservations/PreReservationResponseDto.cs
namespace KineticWorkspace.API.Models.DTOs.PreReservations
{
    public class PreReservationResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int SpaceId { get; set; }
        public string SpaceName { get; set; } = string.Empty;
        public string SpaceType { get; set; } = string.Empty;
        public string? SpaceImageUrl { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public decimal TotalPrice { get; set; }
        public int? NumberOfGuests { get; set; }
        public string? PaymentMethod { get; set; }
        public decimal? PaidAmount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public int ExpiresInMinutes { get; set; }
        public bool IsExpired { get; set; }
        public bool IsPending { get; set; }
        public bool IsPaid { get; set; }
    }

    public class PreReservationPaymentResponseDto
    {
        public int PreReservationId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentIntentId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public DateTime ExpiresAt { get; set; }
    }

    public class PreReservationConfirmResponseDto
    {
        public int ReservationId { get; set; }
        public int InvoiceId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public DateTime PaidAt { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
    }
}