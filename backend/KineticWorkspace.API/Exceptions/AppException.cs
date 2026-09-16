namespace KineticWorkspace.API.Exceptions
{
    /// <summary>
    /// Excepción base de la aplicación. Todas las excepciones de dominio heredan de aquí.
    /// </summary>
    public abstract class AppException : Exception
    {
        public abstract int StatusCode { get; }

        protected AppException(string message) : base(message) { }
        protected AppException(string message, Exception inner) : base(message, inner) { }
    }
}