namespace KineticWorkspace.API.Models.DTOs.Spaces
{
    public class SpaceAvailabilityDto
    {
        public int SpaceId { get; set; }
        public string SpaceName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public List<TimeSlotDto> AvailableSlots { get; set; } = new();
    }

    public class TimeSlotDto
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsAvailable { get; set; }
    }
}