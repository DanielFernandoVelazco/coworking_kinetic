// backend/KineticWorkspace.API/Services/Implementations/AuthService.cs
using AutoMapper;
using KineticWorkspace.API.Helpers;
using KineticWorkspace.API.Models.DTOs.Auth;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly JwtHelper _jwtHelper;
        private readonly IMapper _mapper;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUserRepository userRepository,
            IRefreshTokenRepository refreshTokenRepository,
            JwtHelper jwtHelper,
            IMapper mapper,
            ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _jwtHelper = jwtHelper;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user == null || !PasswordHelper.VerifyPassword(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Email o contraseña incorrectos");
            }

            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException("Cuenta desactivada. Contacta con soporte.");
            }

            await _userRepository.UpdateLastLoginAsync(user.Id);

            var accessToken = _jwtHelper.GenerateJwtToken(user);
            var refreshToken = _jwtHelper.GenerateRefreshToken();

            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };
            await _refreshTokenRepository.AddAsync(refreshTokenEntity);

            return new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn = 3600,
                User = _mapper.Map<UserResponseDto>(user)
            };
        }

        public async Task<LoginResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            if (await _userRepository.ExistsAsync(u => u.Email == request.Email))
            {
                throw new InvalidOperationException("El email ya está registrado");
            }

            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PasswordHash = PasswordHelper.HashPassword(request.Password),
                PhoneNumber = request.PhoneNumber,
                Company = request.Company,
                JobTitle = request.JobTitle,
                IsActive = true,
                IsAdmin = false,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);

            var accessToken = _jwtHelper.GenerateJwtToken(user);
            var refreshToken = _jwtHelper.GenerateRefreshToken();

            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };
            await _refreshTokenRepository.AddAsync(refreshTokenEntity);

            _logger.LogInformation("Nuevo usuario registrado: {Email}", user.Email);

            return new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn = 3600,
                User = _mapper.Map<UserResponseDto>(user)
            };
        }

        public async Task<LoginResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request)
        {
            var refreshTokenEntity = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken);

            if (refreshTokenEntity == null || !refreshTokenEntity.IsActive)
            {
                throw new UnauthorizedAccessException("Refresh token inválido o expirado");
            }

            var user = await _userRepository.GetByIdAsync(refreshTokenEntity.UserId);
            if (user == null || !user.IsActive)
            {
                throw new UnauthorizedAccessException("Usuario no encontrado o desactivado");
            }

            await _refreshTokenRepository.RevokeAsync(refreshTokenEntity.Id);

            var accessToken = _jwtHelper.GenerateJwtToken(user);
            var newRefreshToken = _jwtHelper.GenerateRefreshToken();

            var newRefreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };
            await _refreshTokenRepository.AddAsync(newRefreshTokenEntity);

            return new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = newRefreshToken,
                ExpiresIn = 3600,
                User = _mapper.Map<UserResponseDto>(user)
            };
        }

        public async Task<bool> LogoutAsync(int userId)
        {
            await _refreshTokenRepository.RevokeAllByUserIdAsync(userId);
            return true;
        }

        // ✅ VERSIÓN CORRECTA - Solo UNA definición de cada método
        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null) return true;

            // TODO: Implementar envío de email
            // 1. Generar token de reset
            // 2. Guardar token en base de datos
            // 3. Enviar email con link de reset
            await Task.CompletedTask;
            return true;
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            // TODO: Implementar reset de password
            // 1. Validar token en base de datos
            // 2. Si es válido, buscar usuario
            // 3. Actualizar contraseña
            // 4. Revocar todos los refresh tokens
            // 5. Marcar token como usado
            await Task.CompletedTask;
            return true;
        }

        public async Task<bool> VerifyEmailAsync(string email, string token)
        {
            // TODO: Implementar verificación de email
            // 1. Validar token en base de datos
            // 2. Marcar email como verificado
            await Task.CompletedTask;
            return true;
        }
    }
}