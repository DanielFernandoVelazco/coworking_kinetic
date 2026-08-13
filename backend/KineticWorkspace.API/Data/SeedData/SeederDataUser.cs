// backend/KineticWorkspace.API/Data/SeedData/SeederDataUser.cs
using KineticWorkspace.API.Helpers;
using KineticWorkspace.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace KineticWorkspace.API.Data.SeedData
{
    public class SeederDataUser
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SeederDataUser> _logger;

        public SeederDataUser(ApplicationDbContext context, ILogger<SeederDataUser> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SeedUserReservationsAsync()
        {
            try
            {
                _logger.LogInformation("Verificando datos de usuarios y reservas...");

                // Verificar si ya hay usuarios de prueba
                var testUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == "test@kineticworkspace.com");

                if (testUser != null)
                {
                    _logger.LogInformation("Usuario de prueba ya existe. Verificando reservas...");

                    // Verificar si ya tiene reservas
                    var existingReservations = await _context.Reservations
                        .Where(r => r.UserId == testUser.Id)
                        .CountAsync();

                    if (existingReservations > 0)
                    {
                        _logger.LogInformation($"Usuario de prueba ya tiene {existingReservations} reservas. Saltando seed.");
                        return;
                    }
                }

                _logger.LogInformation("Creando usuario de prueba y reservas historicas...");

                // 1. Obtener o crear usuario de prueba
                var user = await GetOrCreateTestUserAsync();

                // 2. Obtener espacios existentes
                var spaces = await _context.Spaces.Take(10).ToListAsync();
                if (spaces.Count == 0)
                {
                    _logger.LogWarning("No hay espacios disponibles para crear reservas de prueba");
                    return;
                }

                // 3. Crear reservas historicas
                await CreateTestReservationsAsync(user, spaces);

                _logger.LogInformation("Datos de prueba creados exitosamente!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear datos de prueba de usuario");
                throw;
            }
        }

        private async Task<User> GetOrCreateTestUserAsync()
        {
            var email = "test@kineticworkspace.com";
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user != null)
                return user;

            _logger.LogInformation("Creando usuario de prueba...");

            user = new User
            {
                FirstName = "Test",
                LastName = "User",
                Email = email,
                PasswordHash = PasswordHelper.HashPassword("Test123!"),
                PhoneNumber = "+46 70 987 6543",
                Company = "Kinetic Test Company",
                JobTitle = "Software Engineer",
                IsActive = true,
                IsAdmin = false,
                CreatedAt = DateTime.UtcNow.AddDays(-90),
                LastLoginAt = DateTime.UtcNow.AddDays(-1),
                ProfileImageUrl = "https://ui-avatars.com/api/?name=Test+User&size=128&background=a03f28&color=fff&font-size=0.5"
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Usuario de prueba creado: test@kineticworkspace.com / Test123!");

            return user;
        }

        private async Task CreateTestReservationsAsync(User user, List<Space> spaces)
        {
            var random = new Random();
            var statuses = new[] { "Completed", "Confirmed", "Pending", "Cancelled" };
            var now = DateTime.UtcNow;

            // Crear 15 reservas historicas
            for (int i = 0; i < 15; i++)
            {
                var space = spaces[random.Next(spaces.Count)];

                // Fechas: algunas pasadas, algunas futuras
                var daysOffset = random.Next(-60, 30);
                var startTime = now.AddDays(daysOffset).AddHours(random.Next(8, 18));
                var durationHours = random.Next(1, 6);
                var endTime = startTime.AddHours(durationHours);

                // Status basado en fechas
                string status;
                if (startTime < now && endTime < now)
                {
                    status = "Completed";
                }
                else if (startTime > now)
                {
                    status = random.Next(0, 10) < 2 ? "Pending" : "Confirmed";
                }
                else
                {
                    status = random.Next(0, 10) < 3 ? "Cancelled" : "Confirmed";
                }

                var totalPrice = space.PricePerHour * durationHours;

                var reservation = new Reservation
                {
                    UserId = user.Id,
                    SpaceId = space.Id,
                    StartTime = startTime,
                    EndTime = endTime,
                    Status = status,
                    Notes = i % 3 == 0 ? $"Reserva de prueba #{i + 1}" : null,
                    TotalPrice = totalPrice,
                    NumberOfGuests = random.Next(1, Math.Min(space.Capacity, 10)),
                    CreatedAt = startTime.AddDays(-random.Next(1, 10)),
                    UpdatedAt = startTime.AddDays(random.Next(-5, 5)),
                    CancelledAt = status == "Cancelled" ? startTime.AddDays(random.Next(1, 5)) : null,
                    CompletedAt = status == "Completed" ? endTime : null
                };

                await _context.Reservations.AddAsync(reservation);

                // Crear pago para reservas completadas o confirmadas
                if (status == "Completed" || (status == "Confirmed" && random.Next(0, 10) < 5))
                {
                    var payment = new Payment
                    {
                        ReservationId = reservation.Id,
                        UserId = user.Id,
                        Amount = totalPrice,
                        Status = status == "Completed" ? "Completed" : "Pending",
                        PaymentMethod = random.Next(0, 10) < 5 ? "CreditCard" : "PayPal",
                        TransactionId = $"TXN-{Guid.NewGuid():N}".Substring(0, 16),
                        CreatedAt = startTime.AddDays(-random.Next(1, 5)),
                        CompletedAt = status == "Completed" ? endTime.AddDays(random.Next(1, 3)) : null
                    };

                    await _context.Payments.AddAsync(payment);
                }

                // Guardar cada reserva
                if (i % 3 == 0)
                {
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Creadas {i + 1} reservas de prueba...");
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("15 reservas de prueba creadas exitosamente!");
        }
    }
}