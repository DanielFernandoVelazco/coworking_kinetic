using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data.SeedData;
using KineticWorkspace.API.Data.SeedData.Seeders;

namespace KineticWorkspace.API.Data
{
    /// <summary>
    /// Orquestador de seeders. Cada seeder tiene una responsabilidad específica.
    /// </summary>
    public class DataSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DataSeeder> _logger;
        private readonly SeederDataUser _seederDataUser;
        private readonly AmenitySeeder _amenitySeeder;
        private readonly SpaceSeeder _spaceSeeder;
        private readonly AdminUserSeeder _adminUserSeeder;

        public DataSeeder(
            ApplicationDbContext context,
            ILogger<DataSeeder> logger,
            SeederDataUser seederDataUser,
            AmenitySeeder amenitySeeder,
            SpaceSeeder spaceSeeder,
            AdminUserSeeder adminUserSeeder)
        {
            _context = context;
            _logger = logger;
            _seederDataUser = seederDataUser;
            _amenitySeeder = amenitySeeder;
            _spaceSeeder = spaceSeeder;
            _adminUserSeeder = adminUserSeeder;
        }

        public async Task SeedAllAsync()
        {
            try
            {
                _logger.LogInformation("Iniciando verificación de datos iniciales...");

                var existingSpaces = await _context.Spaces.CountAsync();

                if (existingSpaces == 0)
                {
                    _logger.LogInformation("No se encontraron datos. Iniciando precarga de 75 espacios...");

                    await _amenitySeeder.SeedAsync();
                    await _spaceSeeder.SeedAsync();
                    await _adminUserSeeder.SeedAsync();
                }
                else
                {
                    _logger.LogInformation("Ya existen {Count} espacios en la base de datos.", existingSpaces);
                }

                // Siempre verificar y crear datos de usuario de prueba y reservas
                await _seederDataUser.SeedUserReservationsAsync();

                _logger.LogInformation("Verificación de datos completada exitosamente!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante la verificación de datos");
                throw;
            }
        }
    }
}