using KineticWorkspace.API.Models.DTOs.Auth;

namespace KineticWorkspace.API.Services.Interfaces.Users
{
    public interface IUserAdminService
    {
        Task<IEnumerable<UserResponseDto>> GetAllUsersAsync();
        Task<UserResponseDto?> GetUserByIdAsync(int id);
        Task<bool> DeleteUserAsync(int id);
        Task<bool> IsEmailAvailableAsync(string email, int? excludeUserId = null);
    }
}