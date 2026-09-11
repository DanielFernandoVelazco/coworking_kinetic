using KineticWorkspace.API.Models.DTOs.Auth;
using KineticWorkspace.API.Models.DTOs.Users;
using KineticWorkspace.API.Services.Interfaces;
using KineticWorkspace.API.Services.Interfaces.Users;

namespace KineticWorkspace.API.Services.Implementations
{
    /// <summary>
    /// Fachada que delega a los servicios especializados de usuario.
    /// Se mantiene para no romper UsersController (que inyecta IUserService).
    /// </summary>
    public class UserService : IUserService
    {
        private readonly IUserProfileService _profileService;
        private readonly IUserAdminService _adminService;

        public UserService(
            IUserProfileService profileService,
            IUserAdminService adminService)
        {
            _profileService = profileService;
            _adminService = adminService;
        }

        // ========== PERFIL ==========
        public Task<UserProfileDto?> GetUserProfileAsync(int userId)
            => _profileService.GetUserProfileAsync(userId);

        public Task<UserProfileDto?> UpdateUserProfileAsync(int userId, UserUpdateDto request)
            => _profileService.UpdateUserProfileAsync(userId, request);

        public Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto request)
            => _profileService.ChangePasswordAsync(userId, request);

        // ========== ADMIN ==========
        public Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
            => _adminService.GetAllUsersAsync();

        public Task<UserResponseDto?> GetUserByIdAsync(int id)
            => _adminService.GetUserByIdAsync(id);

        public Task<bool> DeleteUserAsync(int id)
            => _adminService.DeleteUserAsync(id);

        public Task<bool> IsEmailAvailableAsync(string email, int? excludeUserId = null)
            => _adminService.IsEmailAvailableAsync(email, excludeUserId);
    }
}