using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Helpers;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Services.Implementations
{
    public class PasswordResetService : IPasswordResetService
    {
        private readonly ApplicationDbContext _context;
        private readonly IUserRepository _userRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly ILogger<PasswordResetService> _logger;

        public PasswordResetService(
            ApplicationDbContext context,
            IUserRepository userRepository,
            IRefreshTokenRepository refreshTokenRepository,
            ILogger<PasswordResetService> logger)
        {
            _context = context;
            _userRepository = userRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _logger = logger;
        }

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);

            if (user == null)
            {
                _logger.LogWarning(
                    "Intento de recuperación de contraseña para email no registrado: {Email}", email);
                return true;
            }

            var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');

            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                CreatedAt = DateTime.UtcNow
            };

            await _context.PasswordResetTokens.AddAsync(resetToken);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Token de recuperación generado para: {Email}. Expira: {ExpiresAt}",
                user.Email, resetToken.ExpiresAt);

            // ⚠️ TODO: Reemplazar por envío de email real
            Console.WriteLine($"🔑 Token de recuperación para {user.Email}: {token}");
            Console.WriteLine($"🔗 Link de recuperación: http://localhost:5134/api/auth/reset-password?token={Uri.EscapeDataString(token)}");

            return true;
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            var resetToken = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.Token == token);

            if (resetToken == null)
            {
                _logger.LogWarning("Intento de reset con token inválido");
                return false;
            }

            if (resetToken.ExpiresAt < DateTime.UtcNow)
            {
                _logger.LogWarning(
                    "Token de recuperación expirado para UserId: {UserId}", resetToken.UserId);
                return false;
            }

            if (resetToken.UsedAt.HasValue)
            {
                _logger.LogWarning(
                    "Token de recuperación ya usado para UserId: {UserId}", resetToken.UserId);
                return false;
            }

            var user = await _userRepository.GetByIdAsync(resetToken.UserId);
            if (user == null) return false;

            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    user.PasswordHash = PasswordHelper.HashPassword(newPassword);
                    user.UpdatedAt = DateTime.UtcNow;
                    await _userRepository.UpdateAsync(user);

                    resetToken.UsedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();

                    await _refreshTokenRepository.RevokeAllByUserIdAsync(user.Id);

                    await transaction.CommitAsync();

                    _logger.LogInformation(
                        "Contraseña actualizada exitosamente para: {Email}", user.Email);

                    return true;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }
    }
}