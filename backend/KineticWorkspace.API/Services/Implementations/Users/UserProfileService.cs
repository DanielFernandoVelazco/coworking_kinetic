using AutoMapper;
using KineticWorkspace.API.Helpers;
using KineticWorkspace.API.Models.DTOs.Users;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Interfaces.Users;

namespace KineticWorkspace.API.Services.Implementations.Users
{
    public class UserProfileService : IUserProfileService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<UserProfileService> _logger;

        public UserProfileService(
            IUserRepository userRepository,
            IRefreshTokenRepository refreshTokenRepository,
            IMapper mapper,
            ILogger<UserProfileService> logger)
        {
            _userRepository = userRepository;
            _refreshTokenRepository = refreshTokenRepository;
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

            // Revocar todos los refresh tokens — fuerza re-login
            await _refreshTokenRepository.RevokeAllByUserIdAsync(userId);

            _logger.LogInformation(
                "Contraseña cambiada para usuario: {Email}. Todos los refresh tokens fueron revocados.",
                user.Email);

            return true;
        }
    }
}