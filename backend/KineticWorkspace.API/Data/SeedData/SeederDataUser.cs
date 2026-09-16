using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data.SeedData.SeedCatalogs;
using KineticWorkspace.API.Data.SeedData.Seeders;
using KineticWorkspace.API.Helpers;
using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Data.SeedData
{
    /// <summary>
    /// Orquesta la creación del usuario de prueba + sus reservas.
    /// La lógica de reservas está en TestReservationSeeder.
    /// </summary>
    public class SeederDataUser
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SeederDataUser> _logger;
        private readonly TestReservationSeeder _reservationSeeder;

        public SeederDataUser(
            ApplicationDbContext context,
            ILogger<SeederDataUser> logger,
            TestReservationSeeder reservationSeeder)
        {
            _context = context;
            _logger = logger;
            _reservationSeeder = reservationSeeder;
        }

        public async Task SeedUserReservationsAsync()
        {
            try
            {
                _logger.LogInformation("Verificando datos de usuarios y reservas...");

                await EnsureReservationsTableExistsAsync();

                var user = await GetOrCreateTestUserAsync();
                if (user == null)
                {
                    _logger.LogWarning("No se pudo crear/obtener el usuario de prueba");
                    return;
                }

                var existingReservations = await _context.Reservations
                    .Where(r => r.UserId == user.Id)
                    .CountAsync();

                if (existingReservations >= TestUserCatalog.ReservationsToSeed)
                {
                    _logger.LogInformation(
                        "Usuario de prueba ya tiene {Count} reservas. Saltando seed.",
                        existingReservations);
                    return;
                }

                if (existingReservations > 0)
                {
                    await DeleteExistingReservationsAsync(user.Id, existingReservations);
                }

                var spaces = await _context.Spaces.Take(15).ToListAsync();
                if (spaces.Count == 0)
                {
                    _logger.LogWarning("No hay espacios disponibles para crear reservas de prueba");
                    return;
                }

                await _reservationSeeder.SeedAsync(user, spaces);

                _logger.LogInformation("Datos de prueba creados exitosamente!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear datos de prueba de usuario");
                throw;
            }
        }

        // ==================== HELPERS ====================

        private async Task EnsureReservationsTableExistsAsync()
        {
            try
            {
                await _context.Reservations.AnyAsync();
            }
            catch
            {
                _logger.LogWarning("Tabla Reservations no existe. Creando...");
                await _context.Database.EnsureCreatedAsync();
                await Task.Delay(100);
            }
        }

        private async Task<User?> GetOrCreateTestUserAsync()
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == TestUserCatalog.Email);

            if (user != null) return user;

            _logger.LogInformation("Creando usuario de prueba...");

            user = new User
            {
                FirstName = TestUserCatalog.FirstName,
                LastName = TestUserCatalog.LastName,
                Email = TestUserCatalog.Email,
                PasswordHash = PasswordHelper.HashPassword(TestUserCatalog.Password),
                PhoneNumber = TestUserCatalog.PhoneNumber,
                Company = TestUserCatalog.Company,
                JobTitle = TestUserCatalog.JobTitle,
                IsActive = true,
                IsAdmin = false,
                CreatedAt = DateTime.UtcNow.AddDays(-90),
                LastLoginAt = DateTime.UtcNow.AddDays(-1),
                ProfileImageUrl = TestUserCatalog.ProfileImageUrl
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Usuario de prueba creado: {Email} / {Password}",
                TestUserCatalog.Email, TestUserCatalog.Password);

            return user;
        }

        private async Task DeleteExistingReservationsAsync(int userId, int count)
        {
            _logger.LogInformation(
                "Eliminando {Count} reservas existentes para recrearlas...", count);

            var reservationsToDelete = await _context.Reservations
                .Where(r => r.UserId == userId)
                .ToListAsync();

            foreach (var reservation in reservationsToDelete)
            {
                var payments = await _context.Payments
                    .Where(p => p.ReservationId == reservation.Id)
                    .ToListAsync();

                if (payments.Any())
                    _context.Payments.RemoveRange(payments);
            }

            _context.Reservations.RemoveRange(reservationsToDelete);
            await _context.SaveChangesAsync();
        }
    }
}