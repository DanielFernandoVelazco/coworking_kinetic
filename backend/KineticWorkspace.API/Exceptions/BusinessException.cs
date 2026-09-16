namespace KineticWorkspace.API.Exceptions
{
    /// <summary>
    /// Errores de reglas de negocio → HTTP 400.
    /// </summary>
    public class BusinessException : AppException
    {
        public override int StatusCode => 400;

        public BusinessException(string message) : base(message) { }
    }
}