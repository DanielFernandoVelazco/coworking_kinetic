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

        // ✅ SIMULACIÓN DE ALMACENAMIENTO DE TOKENS DE RESET
        // En producción, usa una tabla en la base de datos: PasswordResetTokens
        private static readonly Dictionary<string, (string Email, DateTime ExpiresAt)> _resetTokens = new();

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

        /// <summary>
        /// Genera un token de recuperación de contraseña y lo envía al email del usuario
        /// </summary>
        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);

            // 🔒 Por seguridad, NO revelamos si el email existe o no
            // Siempre devolvemos true, incluso si el usuario no existe
            if (user == null)
            {
                _logger.LogWarning("Intento de recuperación de contraseña para email no registrado: {Email}", email);
                return true;
            }

            // ✅ Generar token único de recuperación
            var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');

            // ✅ Guardar token con expiración de 1 hora
            var expiresAt = DateTime.UtcNow.AddHours(1);
            _resetTokens[token] = (user.Email, expiresAt);

            // 🔄 EN PRODUCCIÓN: Enviar email con el link de recuperación
            // var resetLink = $"https://tu-app.com/reset-password?token={Uri.EscapeDataString(token)}";
            // await _emailService.SendResetPasswordEmailAsync(user.Email, resetLink);

            _logger.LogInformation("Token de recuperación generado para: {Email}. Expira: {ExpiresAt}", user.Email, expiresAt);

            // 📝 PARA PRUEBAS: Mostrar el token en la consola
            Console.WriteLine($"🔑 Token de recuperación para {user.Email}: {token}");
            Console.WriteLine($"🔗 Link de recuperación: http://localhost:5134/api/auth/reset-password?token={Uri.EscapeDataString(token)}");

            return true;
        }

        /// <summary>
        /// Valida el token de recuperación y actualiza la contraseña del usuario
        /// </summary>
        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            // ✅ Validar que el token exista
            if (!_resetTokens.TryGetValue(token, out var resetInfo))
            {
                _logger.LogWarning("Intento de reset con token inválido");
                return false;
            }

            // ✅ Validar que el token no haya expirado
            if (resetInfo.ExpiresAt < DateTime.UtcNow)
            {
                _resetTokens.Remove(token);
                _logger.LogWarning("Token de recuperación expirado para: {Email}", resetInfo.Email);
                return false;
            }

            // ✅ Obtener el usuario por email
            var user = await _userRepository.GetByEmailAsync(resetInfo.Email);
            if (user == null)
            {
                _resetTokens.Remove(token);
                return false;
            }

            // ✅ Actualizar la contraseña
            user.PasswordHash = PasswordHelper.HashPassword(newPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            // ✅ Revocar todos los refresh tokens por seguridad
            await _refreshTokenRepository.RevokeAllByUserIdAsync(user.Id);

            // ✅ Eliminar el token usado
            _resetTokens.Remove(token);

            _logger.LogInformation("Contraseña actualizada exitosamente para: {Email}", user.Email);

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