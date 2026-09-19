using KineticWorkspace.API.Extensions;
using AspNetCoreRateLimit;
using Serilog;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

// ==========================================================
// ✅ CARGA DE .env (antes de cualquier AddEnvironmentVariables)
// ==========================================================

// 1. Cargar .env manualmente en el Environment del proceso
var envPath = FindEnvFile();
if (envPath != null)
{
    Env.Load(envPath);

    Console.WriteLine($"✅ .env cargado desde: {envPath}");

    // DEBUG temporal: verificar que las vars críticas llegaron
    var connDebug = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
    var jwtDebug = Environment.GetEnvironmentVariable("JwtSettings__SecretKey");
    Console.WriteLine($"   → ConnectionStrings__DefaultConnection = {(string.IsNullOrEmpty(connDebug) ? "(vacío)" : connDebug)}");
    Console.WriteLine($"   → JwtSettings__SecretKey (length) = {jwtDebug?.Length ?? 0}");
}
else
{
    Console.WriteLine("⚠️ No se encontró archivo .env");
}

// 2. Reconstruir la configuración LIMPIANDO las fuentes por defecto y re-agregando
//    en el orden correcto (env vars DESPUÉS de .env)
builder.Configuration.Sources.Clear();

builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true);

if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>(optional: true);
}

builder.Configuration
    .AddEnvironmentVariables()     // ← Aquí ya están las vars del .env
    .AddCommandLine(args);

// 3. VALIDACIÓN temprana — fallar rápido si falta configuración crítica
ValidateRequiredConfiguration(builder.Configuration);

// ==========================================================
// RESTO DE LA CONFIGURACIÓN
// ==========================================================

// Logging
builder.AddSerilogLogging();

// Excel
builder.ConfigureExcel();

// Rate Limiting
builder.Services.AddCustomRateLimiting(builder.Configuration);

// Controllers & Endpoints
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger
builder.Services.AddCustomSwagger();

// Database
builder.Services.AddDatabase(builder.Configuration, builder.Environment);

// JWT
builder.Services.AddJwtAuthentication(builder.Configuration);

// CORS
builder.Services.AddCustomCors(builder.Configuration, builder.Environment);

// Repos, servicios, helpers, seeders, AutoMapper
builder.Services.AddApplicationServices();

// Health Checks
builder.Services.AddCustomHealthChecks();

var app = builder.Build();

// Manejo global de excepciones (primero en el pipeline)
app.UseGlobalExceptionHandling();

// Rate Limiting
app.UseIpRateLimiting();

// ==========================================================
// ✅ DEBUG: Ver qué configuración está usando EF
// ==========================================================
DumpEffectiveConfiguration(app.Configuration);

// Inicializar base de datos + seeders
await app.InitializeDatabaseAsync();

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(CorsExtensions.PolicyName);
app.UseSerilogRequestLogging();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Health Check
app.MapCustomHealthChecks();

// Info de inicio
var appLogger = app.Services.GetRequiredService<ILogger<Program>>();
appLogger.LogInformation("Kinetic Workspace API iniciada en http://localhost:5134");
appLogger.LogInformation("Swagger disponible en http://localhost:5134/swagger");

app.Run();

// ==========================================================
// MÉTODOS AUXILIARES
// ==========================================================

/// <summary>
/// Busca el archivo .env subiendo por los directorios padres.
/// </summary>
static string? FindEnvFile()
{
    var currentDir = Directory.GetCurrentDirectory();
    var dir = new DirectoryInfo(currentDir);

    for (int i = 0; i < 6 && dir != null; i++)  // máx 6 niveles arriba
    {
        var candidate = Path.Combine(dir.FullName, ".env");
        if (File.Exists(candidate))
            return candidate;

        dir = dir.Parent;
    }

    return null;
}

/// <summary>
/// Valida que la configuración crítica exista. Falla rápido si no.
/// </summary>
static void ValidateRequiredConfiguration(IConfiguration configuration)
{
    var errors = new List<string>();

    var jwtKey = configuration["JwtSettings:SecretKey"];
    if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
    {
        errors.Add("❌ JwtSettings:SecretKey no está configurada o tiene menos de 32 caracteres.");
    }

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        errors.Add("❌ ConnectionStrings:DefaultConnection no está configurada.");
    }

    var allowedOrigins = configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>();
    if (allowedOrigins == null || allowedOrigins.Length == 0)
    {
        errors.Add("❌ CorsSettings:AllowedOrigins debe tener al menos un origen.");
    }

    if (errors.Any())
    {
        throw new InvalidOperationException(
            "\n\n🚨 ERRORES DE CONFIGURACIÓN:\n" +
            string.Join("\n", errors) +
            "\n\n💡 Configura el archivo .env en la raíz del proyecto.\n"
        );
    }
}

/// <summary>
/// Muestra en consola las variables críticas que se están usando.
/// SOLO para debugging. Eliminar en producción.
/// </summary>
static void DumpEffectiveConfiguration(IConfiguration config)
{
    var conn = config.GetConnectionString("DefaultConnection");
    var hasPassword = !string.IsNullOrEmpty(conn) && conn.Contains("Password=");

    Console.WriteLine("=====================================================");
    Console.WriteLine("📋 CONFIGURACIÓN EFECTIVA:");
    Console.WriteLine($"   → Connection string presente: {!string.IsNullOrEmpty(conn)}");
    Console.WriteLine($"   → Contiene Password=: {hasPassword}");
    Console.WriteLine($"   → JWT SecretKey length: {config["JwtSettings:SecretKey"]?.Length ?? 0}");
    Console.WriteLine($"   → CORS origins: {string.Join(", ", config.GetSection("CorsSettings:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>())}");
    Console.WriteLine("=====================================================");
}