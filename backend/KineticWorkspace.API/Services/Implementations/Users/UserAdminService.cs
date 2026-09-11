using AutoMapper;
using KineticWorkspace.API.Models.DTOs.Auth;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Interfaces.Users;

namespace KineticWorkspace.API.Services.Implementations.Users
{
    public class UserAdminService : IUserAdminService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<UserAdminService> _logger;

        public UserAdminService(
            IUserRepository userRepository,
            IRefreshTokenRepository refreshTokenRepository,
            IMapper mapper,
            ILogger<UserAdminService> logger)
        {
            _userRepository = userRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _mapper = mapper;
            _logger = logger;
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

            // Revocar refresh tokens al eliminar usuario
            await _refreshTokenRepository.RevokeAllByUserIdAsync(id);

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