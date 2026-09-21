// Extensions/DatabaseInitializationExtensions.cs
using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;

namespace KineticWorkspace.API.Extensions
{
    public static class DatabaseInitializationExtensions
    {
        /// <summary>
        /// Inicializa la base de datos aplicando migraciones pendientes.
        /// ⚠️ SOLO debe llamarse en Development. En producción las migraciones
        /// se aplican vía CI/CD con `dotnet ef database update`.
        /// </summary>
        public static async Task InitializeDatabaseAsync(this WebApplication app)
        {
            // Guarda defensiva: nunca correr en producción
            if (!app.Environment.IsDevelopment())
            {
                app.Logger.LogInformation(
                    "Saltando InitializeDatabaseAsync (entorno: {Env}). " +
                    "Las migraciones deben aplicarse vía CI/CD.",
                    app.Environment.EnvironmentName);
                return;
            }

            using var scope = app.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

            try
            {
                logger.LogInformation("Aplicando migraciones pendientes...");

                var pending = await dbContext.Database.GetPendingMigrationsAsync();
                var pendingList = pending.ToList();

                if (pendingList.Any())
                {
                    logger.LogInformation(
                        "Migraciones pendientes: {Count} ({Names})",
                        pendingList.Count,
                        string.Join(", ", pendingList));

                    await dbContext.Database.MigrateAsync();
                    logger.LogInformation("Migraciones aplicadas exitosamente");
                }
                else
                {
                    logger.LogInformation("No hay migraciones pendientes");
                }

                logger.LogInformation("Base de datos lista");

                // Seeder solo en desarrollo
                var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
                await seeder.SeedAllAsync();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al inicializar la base de datos");
                // En Development es OK fallar rápido
                throw;
            }
        }
    }
}