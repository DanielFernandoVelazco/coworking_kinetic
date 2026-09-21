// Helpers/TokenHasher.cs
using System.Security.Cryptography;
using System.Text;

namespace KineticWorkspace.API.Helpers
{
    /// <summary>
    /// Hashea tokens (refresh, reset password) antes de persistirlos.
    /// SHA-256 es suficiente aquí: el token ya tiene alta entropía (no es una contraseña).
    /// </summary>
    public static class TokenHasher
    {
        public static string Hash(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new ArgumentException("Token no puede ser vacío", nameof(token));

            var bytes = Encoding.UTF8.GetBytes(token);
            var hash = SHA256.HashData(bytes);
            return Convert.ToHexString(hash); // string hex uppercase, longitud 64
        }

        public static bool Verify(string token, string hash)
        {
            if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(hash))
                return false;

            var computed = Hash(token);
            // Comparación en tiempo constante para evitar timing attacks
            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(computed),
                Encoding.UTF8.GetBytes(hash));
        }
    }
}