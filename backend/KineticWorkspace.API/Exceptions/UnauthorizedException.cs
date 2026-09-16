namespace KineticWorkspace.API.Exceptions
{
    /// <summary>
    /// Falta de permisos o credenciales → HTTP 401.
    /// </summary>
    public class UnauthorizedException : AppException
    {
        public override int StatusCode => 401;

        public UnauthorizedException(string message) : base(message) { }
    }
}