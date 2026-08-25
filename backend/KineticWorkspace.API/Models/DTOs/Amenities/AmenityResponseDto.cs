// backend/KineticWorkspace.API/Models/DTOs/Amenities/AmenityResponseDto.cs
namespace KineticWorkspace.API.Models.DTOs.Amenities
{
    public class AmenityResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Icon { get; set; }
        public bool IsActive { get; set; }
        public int SpacesCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}