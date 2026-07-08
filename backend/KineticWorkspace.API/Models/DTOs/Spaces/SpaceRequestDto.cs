using System.ComponentModel.DataAnnotations;

namespace KineticWorkspace.API.Models.DTOs.Spaces
{
    public class SpaceRequestDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Type { get; set; } = string.Empty;

        [Required]
        [Range(1, 100)]
        public int Capacity { get; set; }

        [Required]
        [Range(0, 9999.99)]
        public decimal PricePerHour { get; set; }

        [Range(0, 9999.99)]
        public decimal? PricePerDay { get; set; }

        [Required]
        [MaxLength(255)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string District { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? PostalCode { get; set; }

        [Required]
        [MaxLength(100)]
        public string Country { get; set; } = "Sweden";

        public List<string>? ImageUrls { get; set; }
        public bool IsAvailable { get; set; } = true;
        public bool IsFeatured { get; set; } = false;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public List<int>? AmenityIds { get; set; }
    }
}