using System.Net;
using System.Text.Json;
using KineticWorkspace.API.Exceptions;

namespace KineticWorkspace.API.Middleware
{
    /// <summary>
    /// Middleware global de manejo de errores. Traduce excepciones a respuestas JSON consistentes.
    /// Respeta el comportamiento actual de los controllers (que ya capturan sus propias excepciones).
    /// </summary>
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (AppException ex)
            {
                // Excepciones de dominio → status code específico
                _logger.LogWarning(ex,
                    "Excepción de dominio en {Method} {Path}: {Message}",
                    context.Request.Method, context.Request.Path, ex.Message);

                await WriteResponseAsync(context, ex.StatusCode, ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                // Compatibilidad: InvalidOperationException → 400 (como hacían los controllers)
                _logger.LogWarning(ex,
                    "InvalidOperationException en {Method} {Path}: {Message}",
                    context.Request.Method, context.Request.Path, ex.Message);

                await WriteResponseAsync(context, 400, ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                // Compatibilidad: UnauthorizedAccessException → 401 (como hacían los controllers)
                _logger.LogWarning(ex,
                    "UnauthorizedAccessException en {Method} {Path}: {Message}",
                    context.Request.Method, context.Request.Path, ex.Message);

                await WriteResponseAsync(context, 401, ex.Message);
            }
            catch (Exception ex)
            {
                // Excepción no controlada → 500
                _logger.LogError(ex,
                    "Excepción no controlada en {Method} {Path}",
                    context.Request.Method, context.Request.Path);

                await WriteResponseAsync(context, 500, "Error interno del servidor");
            }
        }

        private static async Task WriteResponseAsync(HttpContext context, int statusCode, string message)
        {
            if (context.Response.HasStarted)
            {
                // Ya se envió algo al cliente; no podemos escribir.
                return;
            }

            context.Response.Clear();
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            var body = JsonSerializer.Serialize(new { message });
            await context.Response.WriteAsync(body);
        }
    }
}