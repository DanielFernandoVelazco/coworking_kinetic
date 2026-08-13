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

                // Verificar que la tabla Reservations existe
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

                // Obtener o crear usuario de prueba
                var user = await GetOrCreateTestUserAsync();
                if (user == null)
                {
                    _logger.LogWarning("No se pudo crear/obtener el usuario de prueba");
                    return;
                }

                // Verificar reservas existentes
                var existingReservations = await _context.Reservations
                    .Where(r => r.UserId == user.Id)
                    .CountAsync();

                if (existingReservations >= 15)
                {
                    _logger.LogInformation($"Usuario de prueba ya tiene {existingReservations} reservas. Saltando seed.");
                    return;
                }

                // Eliminar reservas existentes si las hay pero son menos de 15
                if (existingReservations > 0)
                {
                    _logger.LogInformation($"Eliminando {existingReservations} reservas existentes para recrearlas...");

                    var reservationsToDelete = await _context.Reservations
                        .Where(r => r.UserId == user.Id)
                        .ToListAsync();

                    foreach (var reservation in reservationsToDelete)
                    {
                        var payments = await _context.Payments
                            .Where(p => p.ReservationId == reservation.Id)
                            .ToListAsync();
                        if (payments.Any())
                        {
                            _context.Payments.RemoveRange(payments);
                        }
                    }

                    _context.Reservations.RemoveRange(reservationsToDelete);
                    await _context.SaveChangesAsync();
                }

                // Obtener espacios
                var spaces = await _context.Spaces.Take(15).ToListAsync();
                if (spaces.Count == 0)
                {
                    _logger.LogWarning("No hay espacios disponibles para crear reservas de prueba");
                    return;
                }

                // Crear reservas
                await CreateTestReservationsAsync(user, spaces);

                _logger.LogInformation("Datos de prueba creados exitosamente!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear datos de prueba de usuario");
                throw;
            }
        }

        private async Task<User?> GetOrCreateTestUserAsync()
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
            var now = DateTime.UtcNow;

            var reservationsToAdd = new List<Reservation>();
            var paymentsToAdd = new List<Payment>();

            _logger.LogInformation($"Creando 15 reservas de prueba para el usuario {user.Email}...");

            for (int i = 0; i < 15; i++)
            {
                var space = spaces[random.Next(spaces.Count)];

                var daysOffset = random.Next(-60, 30);
                var startTime = now.AddDays(daysOffset).AddHours(random.Next(8, 18));
                var durationHours = random.Next(1, 6);
                var endTime = startTime.AddHours(durationHours);

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

                reservationsToAdd.Add(reservation);

                if (status == "Completed" || (status == "Confirmed" && random.Next(0, 10) < 5))
                {
                    var payment = new Payment
                    {
                        UserId = user.Id,
                        Amount = totalPrice,
                        Status = status == "Completed" ? "Completed" : "Pending",
                        PaymentMethod = random.Next(0, 10) < 5 ? "CreditCard" : "PayPal",
                        TransactionId = $"TXN-{Guid.NewGuid():N}".Substring(0, 16),
                        CreatedAt = startTime.AddDays(-random.Next(1, 5)),
                        CompletedAt = status == "Completed" ? endTime.AddDays(random.Next(1, 3)) : null
                    };
                    paymentsToAdd.Add(payment);
                }

                if (i % 3 == 0 && i > 0)
                {
                    _logger.LogInformation($"Preparadas {i} reservas de prueba...");
                }
            }

            _logger.LogInformation($"Preparadas {reservationsToAdd.Count} reservas y {paymentsToAdd.Count} pagos.");

            try
            {
                // Guardar reservas
                await _context.Reservations.AddRangeAsync(reservationsToAdd);
                await _context.SaveChangesAsync();

                // Obtener las reservas recién creadas para asociar los pagos
                var createdReservations = await _context.Reservations
                    .Where(r => r.UserId == user.Id)
                    .OrderByDescending(r => r.Id)
                    .Take(reservationsToAdd.Count)
                    .ToListAsync();

                // Asignar ReservationId a los pagos
                for (int i = 0; i < paymentsToAdd.Count && i < createdReservations.Count; i++)
                {
                    paymentsToAdd[i].ReservationId = createdReservations[i].Id;
                }

                // Guardar pagos
                if (paymentsToAdd.Any())
                {
                    await _context.Payments.AddRangeAsync(paymentsToAdd);
                    await _context.SaveChangesAsync();
                }

                _logger.LogInformation($"Creadas exitosamente {reservationsToAdd.Count} reservas de prueba");
                _logger.LogInformation($"Creados exitosamente {paymentsToAdd.Count} pagos de prueba");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al guardar las reservas de prueba");
                throw;
            }
        }
    }
}