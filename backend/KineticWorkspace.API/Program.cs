// backend/KineticWorkspace.API/Program.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Helpers;
using KineticWorkspace.API.Mappings;
using KineticWorkspace.API.Repositories.Implementations;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Implementations;
using KineticWorkspace.API.Services.Interfaces;
using Serilog;
using AspNetCoreRateLimit; // ✅ AGREGADO

var builder = WebApplication.CreateBuilder(args);

// Configurar Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// ✅ NUEVO: Configurar Rate Limiting
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();
builder.Services.AddInMemoryRateLimiting();

// Agregar servicios al contenedor
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configurar Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Kinetic Workspace API",
        Version = "v1",
        Description = "API para la plataforma de espacios de trabajo Kinetic Workspace"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header usando el esquema Bearer. Ejemplo: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configurar Database Context - MODO DESARROLLO
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    options.UseMySql(
        connectionString,
        new MySqlServerVersion(new Version(10, 4, 32)),
        mysqlOptions => mysqlOptions.EnableRetryOnFailure()
    );

    options.EnableSensitiveDataLogging(builder.Environment.IsDevelopment());
    options.EnableDetailedErrors(builder.Environment.IsDevelopment());
});

// Configurar JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT Secret Key no configurada"));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(secretKey)
    };
});

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

// Registrar DataSeeder
builder.Services.AddScoped<DataSeeder>();

// Registrar Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ISpaceRepository, SpaceRepository>();
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

// Registrar Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISpaceService, SpaceService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<IUserService, UserService>();

// Registrar Helpers
builder.Services.AddScoped<JwtHelper>();

// Registrar AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// Health Checks
builder.Services.AddHealthChecks().AddDbContextCheck<ApplicationDbContext>("Database");

var app = builder.Build();

// ✅ NUEVO: Usar Rate Limiting
app.UseIpRateLimiting();

// 🔥 CREAR BASE DE DATOS AUTOMÁTICAMENTE EN DESARROLLO
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        logger.LogInformation("🔄 Iniciando creación/verificación de la base de datos...");

        var created = await dbContext.Database.EnsureCreatedAsync();

        if (created)
        {
            logger.LogInformation("✅ Base de datos y tablas creadas exitosamente");
        }
        else
        {
            logger.LogInformation("✅ La base de datos ya existe, verificando tablas...");
        }

        try
        {
            var usersCount = await dbContext.Users.CountAsync();
            logger.LogInformation("✅ Tabla Users encontrada con {Count} registros", usersCount);
        }
        catch (Exception ex)
        {
            logger.LogWarning("⚠️ Error al verificar tabla Users: {Message}", ex.Message);
            logger.LogInformation("🔄 Recreando la base de datos...");

            await dbContext.Database.EnsureDeletedAsync();
            await dbContext.Database.EnsureCreatedAsync();

            logger.LogInformation("✅ Base de datos recreada exitosamente");
        }

        logger.LogInformation("📊 Base de datos lista para usar");

        // ✅ AGREGAR: Ejecutar DataSeeder
        var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
        await seeder.SeedAllAsync();
    }
    catch (Exception ex)
    {
        Log.Error(ex, "❌ Error al inicializar la base de datos");
        logger.LogError(ex, "Error detallado: {Message}", ex.Message);

        if (ex.InnerException != null)
        {
            logger.LogError("Inner Exception: {Message}", ex.InnerException.Message);
        }

        logger.LogWarning("⚠️ La aplicación continuará, pero la base de datos puede no estar disponible");
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseSerilogRequestLogging();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Health Check endpoint
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description
            })
        };
        await context.Response.WriteAsJsonAsync(response);
    }
});

// Mostrar información de inicio
var appLogger = app.Services.GetRequiredService<ILogger<Program>>();
appLogger.LogInformation("🚀 Kinetic Workspace API iniciada en http://localhost:5134");
appLogger.LogInformation("📚 Swagger disponible en http://localhost:5134/swagger");

app.Run();