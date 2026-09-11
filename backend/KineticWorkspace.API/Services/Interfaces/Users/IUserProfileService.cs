using KineticWorkspace.API.Models.DTOs.Users;

namespace KineticWorkspace.API.Services.Interfaces.Users
{
    public interface IUserProfileService
    {
        Task<UserProfileDto?> GetUserProfileAsync(int userId);
        Task<UserProfileDto?> UpdateUserProfileAsync(int userId, UserUpdateDto request);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto request);
    }
}