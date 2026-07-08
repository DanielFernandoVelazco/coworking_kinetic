namespace KineticWorkspace.API.Models.DTOs.Reservations
{
    public class ReservationSummaryDto
    {
        public int TotalReservations { get; set; }
        public int ActiveReservations { get; set; }
        public int UpcomingReservations { get; set; }
        public int CompletedReservations { get; set; }
        public int CancelledReservations { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal AverageSpentPerReservation { get; set; }
        public int TotalHoursBooked { get; set; }
        public string? FavoriteSpaceType { get; set; }
    }
}