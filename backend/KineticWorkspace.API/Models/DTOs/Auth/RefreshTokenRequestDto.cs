using System.ComponentModel.DataAnnotations;

namespace KineticWorkspace.API.Models.DTOs.Auth
{
    public class RefreshTokenRequestDto
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}