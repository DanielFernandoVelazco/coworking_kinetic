using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;

namespace KineticWorkspace.API.Extensions
{
    public static class DatabaseInitializationExtensions
    {
        public static async Task InitializeDatabaseAsync(this WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

            try
            {
                logger.LogInformation("Iniciando creacion/verificacion de la base de datos...");

                var created = await dbContext.Database.EnsureCreatedAsync();

                if (created)
                    logger.LogInformation("Base de datos y tablas creadas exitosamente");
                else
                    logger.LogInformation("La base de datos ya existe, verificando tablas...");

                try
                {
                    var usersCount = await dbContext.Users.CountAsync();
                    logger.LogInformation("Tabla Users encontrada con {Count} registros", usersCount);
                }
                catch (Exception ex)
                {
                    logger.LogWarning("Error al verificar tabla Users: {Message}", ex.Message);
                    logger.LogInformation("Recreando la base de datos...");
                    await dbContext.Database.EnsureDeletedAsync();
                    await dbContext.Database.EnsureCreatedAsync();
                    logger.LogInformation("Base de datos recreada exitosamente");
                }

                logger.LogInformation("Base de datos lista para usar");

                var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
                await seeder.SeedAllAsync();
            }
            catch (Exception ex)
            {
                Serilog.Log.Error(ex, "Error al inicializar la base de datos");
                logger.LogError(ex, "Error detallado: {Message}", ex.Message);

                if (ex.InnerException != null)
                    logger.LogError("Inner Exception: {Message}", ex.InnerException.Message);

                logger.LogWarning("La aplicacion continuara, pero la base de datos puede no estar disponible");
            }
        }
    }
}