namespace KineticWorkspace.API.Exceptions
{
    /// <summary>
    /// El usuario está autenticado pero no tiene permiso sobre el recurso → HTTP 403.
    /// Distinto de UnauthorizedException (401), que implica falta de credenciales.
    /// </summary>
    public class ForbiddenException : AppException
    {
        public override int StatusCode => 403;

        public ForbiddenException(string message) : base(message) { }
    }
}