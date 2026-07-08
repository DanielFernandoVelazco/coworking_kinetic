namespace KineticWorkspace.API.Models.DTOs.Reservations
{
    public class ReservationResponseDto
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
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public decimal? PaidAmount { get; set; }
        public string? PaymentStatus { get; set; }
    }
}