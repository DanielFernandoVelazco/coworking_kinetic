using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data.SeedData.SeedCatalogs;
using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Data.SeedData.Seeders
{
    /// <summary>
    /// Genera reservas y pagos de prueba para el usuario test.
    /// No crea el usuario — eso lo hace SeederDataUser.
    /// </summary>
    public class TestReservationSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TestReservationSeeder> _logger;
        private readonly Random _random = new();

        public TestReservationSeeder(
            ApplicationDbContext context,
            ILogger<TestReservationSeeder> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SeedAsync(User user, List<Space> spaces)
        {
            var now = DateTime.UtcNow;
            var reservationsToAdd = new List<Reservation>();
            var paymentsToAdd = new List<Payment>();

            _logger.LogInformation(
                "Creando {Count} reservas de prueba para el usuario {Email}...",
                TestUserCatalog.ReservationsToSeed, user.Email);

            for (int i = 0; i < TestUserCatalog.ReservationsToSeed; i++)
            {
                var space = spaces[_random.Next(spaces.Count)];
                var (startTime, endTime) = GenerateTimeRange(now);
                var status = DetermineStatus(startTime, endTime, now);
                var totalPrice = space.PricePerHour * (decimal)(endTime - startTime).TotalHours;

                var reservation = BuildReservation(
                    user, space, startTime, endTime, status, totalPrice, i);
                reservationsToAdd.Add(reservation);

                if (ShouldCreatePayment(status))
                {
                    paymentsToAdd.Add(BuildPayment(user, totalPrice, status, startTime, endTime));
                }
            }

            _logger.LogInformation(
                "Preparadas {ReservationCount} reservas y {PaymentCount} pagos.",
                reservationsToAdd.Count, paymentsToAdd.Count);

            await SaveReservationsAndPaymentsAsync(user, reservationsToAdd, paymentsToAdd);
        }

        // ==================== HELPERS ====================

        private (DateTime start, DateTime end) GenerateTimeRange(DateTime now)
        {
            var daysOffset = _random.Next(-60, 30);
            var startTime = now.AddDays(daysOffset).AddHours(_random.Next(8, 18));
            var durationHours = _random.Next(1, 6);
            return (startTime, startTime.AddHours(durationHours));
        }

        private string DetermineStatus(DateTime startTime, DateTime endTime, DateTime now)
        {
            if (startTime < now && endTime < now)
                return "Completed";

            if (startTime > now)
                return _random.Next(0, 10) < 2 ? "Pending" : "Confirmed";

            return _random.Next(0, 10) < 3 ? "Cancelled" : "Confirmed";
        }

        private bool ShouldCreatePayment(string status)
        {
            return status == "Completed"
                || (status == "Confirmed" && _random.Next(0, 10) < 5);
        }

        private Reservation BuildReservation(
            User user, Space space, DateTime startTime, DateTime endTime,
            string status, decimal totalPrice, int index)
        {
            return new Reservation
            {
                UserId = user.Id,
                SpaceId = space.Id,
                StartTime = startTime,
                EndTime = endTime,
                Status = status,
                Notes = index % 3 == 0 ? $"Reserva de prueba #{index + 1}" : null,
                TotalPrice = totalPrice,
                NumberOfGuests = _random.Next(1, Math.Min(space.Capacity, 10)),
                CreatedAt = startTime.AddDays(-_random.Next(1, 10)),
                UpdatedAt = startTime.AddDays(_random.Next(-5, 5)),
                CancelledAt = status == "Cancelled" ? startTime.AddDays(_random.Next(1, 5)) : null,
                CompletedAt = status == "Completed" ? endTime : null
            };
        }

        private Payment BuildPayment(
            User user, decimal amount, string status, DateTime startTime, DateTime endTime)
        {
            return new Payment
            {
                UserId = user.Id,
                Amount = amount,
                Status = status == "Completed" ? "Completed" : "Pending",
                PaymentMethod = _random.Next(0, 10) < 5 ? "CreditCard" : "PayPal",
                TransactionId = $"TXN-{Guid.NewGuid():N}".Substring(0, 16),
                CreatedAt = startTime.AddDays(-_random.Next(1, 5)),
                CompletedAt = status == "Completed"
                    ? endTime.AddDays(_random.Next(1, 3))
                    : null
            };
        }

        private async Task SaveReservationsAndPaymentsAsync(
            User user,
            List<Reservation> reservations,
            List<Payment> payments)
        {
            await _context.Reservations.AddRangeAsync(reservations);
            await _context.SaveChangesAsync();

            var createdReservations = await _context.Reservations
                .Where(r => r.UserId == user.Id)
                .OrderByDescending(r => r.Id)
                .Take(reservations.Count)
                .ToListAsync();

            for (int i = 0; i < payments.Count && i < createdReservations.Count; i++)
            {
                payments[i].ReservationId = createdReservations[i].Id;
            }

            if (payments.Any())
            {
                await _context.Payments.AddRangeAsync(payments);
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation(
                "Creadas exitosamente {ReservationCount} reservas de prueba", reservations.Count);
            _logger.LogInformation(
                "Creados exitosamente {PaymentCount} pagos de prueba", payments.Count);
        }
    }
}