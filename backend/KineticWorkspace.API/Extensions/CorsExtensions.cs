using Serilog;

namespace KineticWorkspace.API.Extensions
{
    public static class CorsExtensions
    {
        public const string PolicyName = "KineticCorsPolicy";

        /// <summary>
        /// Configura CORS con una whitelist estricta de orígenes.
        /// Lee los orígenes permitidos desde CorsSettings:AllowedOrigins.
        /// </summary>
        public static IServiceCollection AddCustomCors(
            this IServiceCollection services,
            IConfiguration configuration,
            IWebHostEnvironment environment)
        {
            var allowedOrigins = configuration
                .GetSection("CorsSettings:AllowedOrigins")
                .Get<string[]>() ?? Array.Empty<string>();

            // ==================== VALIDACIONES ====================

            if (allowedOrigins.Length == 0)
            {
                throw new InvalidOperationException(
                    "❌ CorsSettings:AllowedOrigins debe tener al menos un origen configurado. " +
                    "Configúralo en .env con: CorsSettings__AllowedOrigins__0=http://localhost:5173");
            }

            // Rechazar comodín explícitamente
            if (allowedOrigins.Any(o => o.Trim() == "*"))
            {
                throw new InvalidOperationException(
                    "❌ CorsSettings:AllowedOrigins no puede contener '*'. " +
                    "Especifica los orígenes explícitamente (ej: https://tu-dominio.com).");
            }

            // Validar que cada origen sea una URL absoluta válida
            var invalidOrigins = allowedOrigins
                .Where(o => !IsValidOrigin(o))
                .ToList();

            if (invalidOrigins.Any())
            {
                throw new InvalidOperationException(
                    $"❌ Los siguientes orígenes CORS no son válidos: {string.Join(", ", invalidOrigins)}. " +
                    "Deben ser URLs absolutas sin trailing slash (ej: http://localhost:5173).");
            }

            // En producción, no permitir localhost
            if (!environment.IsDevelopment())
            {
                var localhostOrigins = allowedOrigins
                    .Where(o => o.Contains("localhost") || o.Contains("127.0.0.1"))
                    .ToList();

                if (localhostOrigins.Any())
                {
                    throw new InvalidOperationException(
                        $"❌ No se permiten orígenes localhost en producción: {string.Join(", ", localhostOrigins)}. " +
                        "Configura dominios reales en CorsSettings:AllowedOrigins.");
                }
            }

            // ==================== LOG ====================

            Log.Information("🌐 CORS configurado con {Count} origen(es): {Origins}",
                allowedOrigins.Length,
                string.Join(", ", allowedOrigins));

            // ==================== REGISTRO ====================

            services.AddCors(options =>
            {
                options.AddPolicy(PolicyName, policy =>
                {
                    policy
                        .WithOrigins(allowedOrigins)                    // Whitelist
                        .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .WithHeaders(
                            "Content-Type",
                            "Authorization",
                            "X-Requested-With",
                            "X-ClientId"
                        )
                        .WithExposedHeaders(
                            "Content-Disposition",                     // Para descargas de archivos (Excel)
                            "X-Total-Count"                             // Para paginación
                        )
                        .SetPreflightMaxAge(TimeSpan.FromMinutes(10))   // Cache de preflight
                        .AllowCredentials();                            // Necesario para cookies/tokens
                });

                // ✅ Política de fallback para peticiones sin Origin (curl, Postman, health checks)
                options.AddDefaultPolicy(policy =>
                {
                    policy
                        .WithOrigins(allowedOrigins)
                        .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .WithHeaders("Content-Type", "Authorization")
                        .AllowCredentials();
                });
            });

            return services;
        }

        /// <summary>
        /// Valida que un string sea un origen HTTP/HTTPS válido.
        /// No permite trailing slash, paths ni comodines.
        /// </summary>
        private static bool IsValidOrigin(string origin)
        {
            if (string.IsNullOrWhiteSpace(origin)) return false;

            // No permitir trailing slash
            if (origin.EndsWith("/")) return false;

            if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri)) return false;

            // Debe ser http o https
            if (uri.Scheme != "http" && uri.Scheme != "https") return false;

            // No debe tener path, query ni fragment
            if (!string.IsNullOrEmpty(uri.AbsolutePath) && uri.AbsolutePath != "/") return false;

            return true;
        }
    }
}