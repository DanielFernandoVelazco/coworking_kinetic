using System.ComponentModel.DataAnnotations;

namespace KineticWorkspace.API.Models.DTOs.Reservations
{
    public class ReservationRequestDto
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
    }
}