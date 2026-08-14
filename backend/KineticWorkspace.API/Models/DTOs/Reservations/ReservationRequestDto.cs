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

    // solicitudes paginadas con ordenamiento
    public class ReservationFilterRequestDto
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "date_desc"; // date_desc, date_asc, price_desc, price_asc, guests_desc, guests_asc
        public string? Status { get; set; } // all, upcoming, active, past, pending, cancelled
    }
}