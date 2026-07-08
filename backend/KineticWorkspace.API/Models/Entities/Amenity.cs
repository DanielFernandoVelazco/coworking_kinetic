using System.ComponentModel.DataAnnotations;

namespace KineticWorkspace.API.Models.Entities
{
    public class Amenity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string? Icon { get; set; } // Material icon name

        public bool IsActive { get; set; } = true;

        public virtual ICollection<Space> Spaces { get; set; } = new List<Space>();
    }
}