using KineticWorkspace.API.Middleware;

namespace KineticWorkspace.API.Extensions
{
    public static class ExceptionMiddlewareExtensions
    {
        /// <summary>
        /// Registra el middleware global de manejo de errores.
        /// Debe ir ANTES de cualquier otro middleware (excepto el de Swagger en dev).
        /// </summary>
        public static WebApplication UseGlobalExceptionHandling(this WebApplication app)
        {
            app.UseMiddleware<ExceptionHandlingMiddleware>();
            return app;
        }
    }
}