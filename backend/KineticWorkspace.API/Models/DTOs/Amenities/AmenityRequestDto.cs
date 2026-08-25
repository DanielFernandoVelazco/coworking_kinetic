// backend/KineticWorkspace.API/Models/DTOs/Amenities/AmenityRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace KineticWorkspace.API.Models.DTOs.Amenities
{
    public class AmenityRequestDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string? Icon { get; set; }

        public bool IsActive { get; set; } = true;
    }
}