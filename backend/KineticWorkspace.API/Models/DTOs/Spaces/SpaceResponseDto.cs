// backend/KineticWorkspace.API/Models/DTOs/Spaces/SpaceResponseDto.cs

namespace KineticWorkspace.API.Models.DTOs.Spaces
{
    public class SpaceResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public decimal PricePerHour { get; set; }
        public decimal? PricePerDay { get; set; }
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string? PostalCode { get; set; }
        public string Country { get; set; } = string.Empty;
        public List<string>? ImageUrls { get; set; }
        public bool IsAvailable { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsActive { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public List<string> Amenities { get; set; } = new();

        // ✅ NUEVO: IDs de amenidades para el frontend
        public List<int> AmenityIds { get; set; } = new();

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}