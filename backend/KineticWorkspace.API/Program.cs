using KineticWorkspace.API.Extensions;
using AspNetCoreRateLimit;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

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
builder.Services.AddCustomCors();

// Repos, servicios, helpers, seeders, AutoMapper
builder.Services.AddApplicationServices();

// Health Checks
builder.Services.AddCustomHealthChecks();

var app = builder.Build();

// Rate Limiting
app.UseIpRateLimiting();

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