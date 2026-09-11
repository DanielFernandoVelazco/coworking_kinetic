using AutoMapper;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Helpers;
using KineticWorkspace.API.Models.DTOs.Auth;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace KineticWorkspace.API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IJwtHelper _jwtHelper;
        private readonly IMapper _mapper;
        private readonly ILogger<AuthService> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IPasswordResetService _passwordResetService;


        public AuthService(
    IUserRepository userRepository,
    IRefreshTokenRepository refreshTokenRepository,
    IJwtHelper jwtHelper,
    IMapper mapper,
    ILogger<AuthService> logger,
    ApplicationDbContext context,
    IPasswordResetService passwordResetService)
        {
            _userRepository = userRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _jwtHelper = jwtHelper;
            _mapper = mapper;
            _logger = logger;
            _context = context;
            _passwordResetService = passwordResetService;
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
            var refreshToken = await CreateRefreshTokenAsync(user.Id);

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

            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
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
                    var refreshToken = await CreateRefreshTokenAsync(user.Id);

                    await transaction.CommitAsync();

                    _logger.LogInformation("Nuevo usuario registrado: {Email}", user.Email);

                    return new LoginResponseDto
                    {
                        AccessToken = accessToken,
                        RefreshToken = refreshToken,
                        ExpiresIn = 3600,
                        User = _mapper.Map<UserResponseDto>(user)
                    };
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
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

            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    await _refreshTokenRepository.RevokeAsync(refreshTokenEntity.Id);

                    var accessToken = _jwtHelper.GenerateJwtToken(user);
                    var newRefreshToken = await CreateRefreshTokenAsync(user.Id);

                    await transaction.CommitAsync();

                    return new LoginResponseDto
                    {
                        AccessToken = accessToken,
                        RefreshToken = newRefreshToken,
                        ExpiresIn = 3600,
                        User = _mapper.Map<UserResponseDto>(user)
                    };
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        public async Task<bool> LogoutAsync(int userId)
        {
            await _refreshTokenRepository.RevokeAllByUserIdAsync(userId);
            return true;
        }

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            return await _passwordResetService.ForgotPasswordAsync(email);
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            return await _passwordResetService.ResetPasswordAsync(token, newPassword);
        }

        public async Task<bool> VerifyEmailAsync(string email, string token)
        {
            // TODO: Implementar verificación de email
            await Task.CompletedTask;
            return true;
        }

        // ==================== HELPERS PRIVADOS ====================

        /// <summary>
        /// Genera un refresh token nuevo, lo persiste y lo devuelve en texto plano.
        /// </summary>
        private async Task<string> CreateRefreshTokenAsync(int userId)
        {
            var refreshToken = _jwtHelper.GenerateRefreshToken();

            var refreshTokenEntity = new RefreshToken
            {
                UserId = userId,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };

            await _refreshTokenRepository.AddAsync(refreshTokenEntity);

            return refreshToken;
        }
    }
}