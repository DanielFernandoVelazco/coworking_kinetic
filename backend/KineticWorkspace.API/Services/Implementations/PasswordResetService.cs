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
        private readonly IWebHostEnvironment _environment;

        public PasswordResetService(
            ApplicationDbContext context,
            IUserRepository userRepository,
            IRefreshTokenRepository refreshTokenRepository,
            ILogger<PasswordResetService> logger,
            IWebHostEnvironment environment)
        {
            _context = context;
            _userRepository = userRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _logger = logger;
            _environment = environment;
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

            // ✅ FIX C2: generar token con alta entropía criptográfica
            var rawToken = GenerateSecureToken();

            // ✅ FIX C2: en BD se guarda SOLO el hash, nunca el token plano
            var tokenHash = TokenHasher.Hash(rawToken);

            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                Token = tokenHash, // ← hash SHA-256 (hex, 64 chars)
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                CreatedAt = DateTime.UtcNow
            };

            await _context.PasswordResetTokens.AddAsync(resetToken);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Token de recuperación generado para: {Email}. Expira: {ExpiresAt}",
                user.Email, resetToken.ExpiresAt);

            // ⚠️ TODO: Reemplazar por envío de email real.
            // En dev, imprimimos el token en consola para pruebas locales.
            // En producción NUNCA se expone — se envía por email al usuario.
            if (_environment.IsDevelopment())
            {
                Console.WriteLine($"🔑 Token de recuperación para {user.Email}: {rawToken}");
                Console.WriteLine($"🔗 Link de recuperación: http://localhost:5134/api/auth/reset-password?token={Uri.EscapeDataString(rawToken)}");
            }
            else
            {
                _logger.LogWarning(
                    "⚠️ Password reset para {Email} ejecutado en entorno {Environment}. " +
                    "El envío de email aún NO está implementado. " +
                    "El usuario NO podrá completar el reset hasta que se implemente el envío real.",
                    user.Email, _environment.EnvironmentName);
            }

            return true;
        }

        public async Task<bool> ResetPasswordAsync(string rawToken, string newPassword)
        {
            // ✅ FIX C2: hashear el token recibido antes de buscar en BD
            var tokenHash = TokenHasher.Hash(rawToken);

            var resetToken = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.Token == tokenHash); // ← buscar por hash

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

        // ==================== HELPERS PRIVADOS ====================

        /// <summary>
        /// Genera un token URL-safe de alta entropía (512 bits).
        /// Formato: base64url sin padding.
        /// </summary>
        private static string GenerateSecureToken()
        {
            var bytes = new byte[64]; // 512 bits
            System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);

            return Convert.ToBase64String(bytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');
        }
    }
}