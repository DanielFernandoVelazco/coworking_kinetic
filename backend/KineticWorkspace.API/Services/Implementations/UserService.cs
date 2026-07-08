using AutoMapper;
using KineticWorkspace.API.Helpers;
using KineticWorkspace.API.Models.DTOs.Auth;
using KineticWorkspace.API.Models.DTOs.Users;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<UserService> _logger;

        public UserService(IUserRepository userRepository, IMapper mapper, ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<UserProfileDto?> GetUserProfileAsync(int userId)
        {
            var user = await _userRepository.GetUserWithReservationsAsync(userId);
            if (user == null) return null;

            var profile = _mapper.Map<UserProfileDto>(user);
            profile.TotalReservations = user.Reservations.Count;
            profile.TotalReviews = user.Reviews.Count;

            return profile;
        }

        public async Task<UserProfileDto?> UpdateUserProfileAsync(int userId, UserUpdateDto request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return null;

            _mapper.Map(request, user);
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
            _logger.LogInformation("Perfil de usuario actualizado: {Email}", user.Email);

            return _mapper.Map<UserProfileDto>(user);
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            if (!PasswordHelper.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                return false;
            }

            user.PasswordHash = PasswordHelper.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
            _logger.LogInformation("Contraseña cambiada para usuario: {Email}", user.Email);

            return true;
        }

        public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<UserResponseDto>>(users);
        }

        public async Task<UserResponseDto?> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            return user != null ? _mapper.Map<UserResponseDto>(user) : null;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return false;

            user.DeletedAt = DateTime.UtcNow;
            user.IsActive = false;
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("Usuario eliminado: {Email}", user.Email);
            return true;
        }

        public async Task<bool> IsEmailAvailableAsync(string email, int? excludeUserId = null)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null) return true;

            if (excludeUserId.HasValue && user.Id == excludeUserId.Value)
                return true;

            return false;
        }
    }
}