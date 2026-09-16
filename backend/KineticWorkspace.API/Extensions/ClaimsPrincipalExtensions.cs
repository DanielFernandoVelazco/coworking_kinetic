using System.Security.Claims;

namespace KineticWorkspace.API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        private const string UserIdClaim = "userId";

        /// <summary>
        /// Obtiene el ID del usuario autenticado desde los claims.
        /// Lanza UnauthorizedAccessException si el claim no existe o no es válido.
        /// </summary>
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(UserIdClaim)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("Usuario no autenticado");

            if (!int.TryParse(userIdClaim, out var userId) || userId <= 0)
                throw new UnauthorizedAccessException("Identificador de usuario inválido");

            return userId;
        }

        /// <summary>
        /// Intenta obtener el ID del usuario. Devuelve false si no existe.
        /// Útil para flujos donde no quieres excepción (ej: endpoints opcionales).
        /// </summary>
        public static bool TryGetUserId(this ClaimsPrincipal user, out int userId)
        {
            userId = 0;

            var userIdClaim = user.FindFirst(UserIdClaim)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return false;

            return int.TryParse(userIdClaim, out userId) && userId > 0;
        }

        /// <summary>
        /// Indica si el usuario autenticado es administrador.
        /// </summary>
        public static bool IsAdmin(this ClaimsPrincipal user)
        {
            return user.IsInRole("Admin");
        }
    }
}