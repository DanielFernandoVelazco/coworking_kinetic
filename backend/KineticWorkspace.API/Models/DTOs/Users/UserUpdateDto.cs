using System.ComponentModel.DataAnnotations;

namespace KineticWorkspace.API.Models.DTOs.Users
{
    public class UserUpdateDto
    {
        [MaxLength(100)]
        public string? FirstName { get; set; }

        [MaxLength(100)]
        public string? LastName { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(500)]
        public string? ProfileImageUrl { get; set; }

        [MaxLength(255)]
        public string? Company { get; set; }

        [MaxLength(255)]
        public string? JobTitle { get; set; }
    }
}