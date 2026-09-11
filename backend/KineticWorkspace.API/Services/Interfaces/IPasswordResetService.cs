namespace KineticWorkspace.API.Services.Interfaces
{
    public interface IPasswordResetService
    {
        /// <summary>
        /// Genera un token de recuperación y lo persiste. Devuelve true siempre
        /// (para no filtrar si el email existe o no).
        /// </summary>
        Task<bool> ForgotPasswordAsync(string email);

        /// <summary>
        /// Valida el token, actualiza la contraseña y revoca refresh tokens.
        /// </summary>
        Task<bool> ResetPasswordAsync(string token, string newPassword);
    }
}