// backend/KineticWorkspace.API/Services/Implementations/AdminService.cs
using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.DTOs.Admin;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Services.Implementations
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminService> _logger;

        public AdminService(ApplicationDbContext context, ILogger<AdminService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<AdminDashboardDto> GetDashboardDataAsync()
        {
            var summary = await GetSummaryMetricsAsync();
            var monthlyReservations = await GetMonthlyReservationsAsync(12);
            var monthlyRevenue = await GetMonthlyRevenueAsync(12);
            var recentReservations = await GetRecentReservationsAsync(10);
            var topUsers = await GetTopUsersAsync(10);
            var topSpaces = await GetTopSpacesAsync(10);
            var spaceStatus = await GetSpaceStatusAsync();
            var systemHealth = await GetSystemHealthAsync();
            var reservationStatusDistribution = await GetReservationStatusDistributionAsync();
            var spaceTypeDistribution = await GetSpaceTypeDistributionAsync();

            return new AdminDashboardDto
            {
                Summary = summary,
                MonthlyReservations = monthlyReservations,
                MonthlyRevenue = monthlyRevenue,
                RecentReservations = recentReservations,
                TopUsers = topUsers,
                TopSpaces = topSpaces,
                SpaceStatus = spaceStatus,
                SystemHealth = systemHealth,
                ReservationStatusDistribution = reservationStatusDistribution,
                SpaceTypeDistribution = spaceTypeDistribution
            };
        }

        public async Task<SummaryMetricsDto> GetSummaryMetricsAsync()
        {
            try
            {
                var now = DateTime.UtcNow;
                var startOfMonth = new DateTime(now.Year, now.Month, 1);

                // Usuarios
                var totalUsers = await _context.Users.CountAsync(u => u.DeletedAt == null);
                var activeUsers = await _context.Users.CountAsync(u => u.IsActive && u.DeletedAt == null);
                var newUsersThisMonth = await _context.Users
                    .CountAsync(u => u.CreatedAt >= startOfMonth && u.DeletedAt == null);

                // Espacios
                var totalSpaces = await _context.Spaces.CountAsync(s => s.DeletedAt == null);
                var availableSpaces = await _context.Spaces
                    .CountAsync(s => s.IsAvailable && s.IsActive && s.DeletedAt == null);

                // Reservas
                var totalReservations = await _context.Reservations.CountAsync();
                var activeReservations = await _context.Reservations
                    .CountAsync(r => r.Status == "Confirmed" && r.StartTime <= now && r.EndTime >= now);
                var pendingReservations = await _context.Reservations
                    .CountAsync(r => r.Status == "Pending");
                var completedReservations = await _context.Reservations
                    .CountAsync(r => r.Status == "Completed");
                var cancelledReservations = await _context.Reservations
                    .CountAsync(r => r.Status == "Cancelled");

                // ✅ CORREGIDO: Usar DefaultIfEmpty() para evitar el error del operador ?? con decimal
                var totalRevenue = await _context.Payments
                    .Where(p => p.Status == "Completed")
                    .SumAsync(p => (decimal?)p.Amount) ?? 0m;

                var monthlyRevenue = await _context.Payments
                    .Where(p => p.Status == "Completed" && p.CreatedAt >= startOfMonth)
                    .SumAsync(p => (decimal?)p.Amount) ?? 0m;

                var averageRevenuePerBooking = totalReservations > 0
                    ? totalRevenue / totalReservations
                    : 0m;

                // Tasa de ocupación (espacios ocupados / espacios totales)
                var occupiedSpaces = await _context.Reservations
                    .Where(r => r.Status == "Confirmed" && r.StartTime <= now && r.EndTime >= now)
                    .Select(r => r.SpaceId)
                    .Distinct()
                    .CountAsync();

                var occupancyRate = totalSpaces > 0
                    ? (decimal)occupiedSpaces / totalSpaces * 100
                    : 0m;

                return new SummaryMetricsDto
                {
                    TotalUsers = totalUsers,
                    ActiveUsers = activeUsers,
                    NewUsersThisMonth = newUsersThisMonth,
                    TotalSpaces = totalSpaces,
                    AvailableSpaces = availableSpaces,
                    TotalReservations = totalReservations,
                    ActiveReservations = activeReservations,
                    PendingReservations = pendingReservations,
                    CompletedReservations = completedReservations,
                    CancelledReservations = cancelledReservations,
                    TotalRevenue = totalRevenue,
                    MonthlyRevenue = monthlyRevenue,
                    AverageRevenuePerBooking = averageRevenuePerBooking,
                    OccupancyRate = Math.Round(occupancyRate, 1)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener métricas del dashboard");
                throw;
            }
        }

        public async Task<List<MonthlyMetricDto>> GetMonthlyReservationsAsync(int months = 12)
        {
            var result = new List<MonthlyMetricDto>();
            var now = DateTime.UtcNow;

            for (int i = months - 1; i >= 0; i--)
            {
                var date = now.AddMonths(-i);
                var startOfMonth = new DateTime(date.Year, date.Month, 1);
                var endOfMonth = startOfMonth.AddMonths(1);

                var count = await _context.Reservations
                    .CountAsync(r => r.CreatedAt >= startOfMonth && r.CreatedAt < endOfMonth);

                result.Add(new MonthlyMetricDto
                {
                    Month = startOfMonth.ToString("MMM yyyy"),
                    Count = count,
                    Amount = 0
                });
            }

            return result;
        }

        public async Task<List<MonthlyMetricDto>> GetMonthlyRevenueAsync(int months = 12)
        {
            var result = new List<MonthlyMetricDto>();
            var now = DateTime.UtcNow;

            for (int i = months - 1; i >= 0; i--)
            {
                var date = now.AddMonths(-i);
                var startOfMonth = new DateTime(date.Year, date.Month, 1);
                var endOfMonth = startOfMonth.AddMonths(1);

                // ✅ CORREGIDO: Usar nullable decimal
                var revenue = await _context.Payments
                    .Where(p => p.Status == "Completed" && p.CreatedAt >= startOfMonth && p.CreatedAt < endOfMonth)
                    .SumAsync(p => (decimal?)p.Amount) ?? 0m;

                result.Add(new MonthlyMetricDto
                {
                    Month = startOfMonth.ToString("MMM yyyy"),
                    Count = 0,
                    Amount = revenue
                });
            }

            return result;
        }

        public async Task<List<RecentReservationDto>> GetRecentReservationsAsync(int limit = 10)
        {
            var reservations = await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Space)
                .OrderByDescending(r => r.CreatedAt)
                .Take(limit)
                .ToListAsync();

            var result = new List<RecentReservationDto>();

            foreach (var r in reservations)
            {
                result.Add(new RecentReservationDto
                {
                    Id = r.Id,
                    UserName = r.User != null ? $"{r.User.FirstName} {r.User.LastName}" : "Unknown",
                    UserEmail = r.User != null ? r.User.Email : "unknown@email.com",
                    SpaceName = r.Space != null ? r.Space.Name : "Unknown Space",
                    StartTime = r.StartTime,
                    EndTime = r.EndTime,
                    Status = r.Status,
                    TotalPrice = r.TotalPrice,
                    CreatedAt = r.CreatedAt
                });
            }

            return result;
        }

        public async Task<List<TopUserDto>> GetTopUsersAsync(int limit = 10)
        {
            var reservations = await _context.Reservations
                .Include(r => r.User)
                .Where(r => r.User != null)
                .GroupBy(r => r.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    UserName = g.FirstOrDefault() != null && g.FirstOrDefault().User != null
                        ? $"{g.FirstOrDefault().User.FirstName} {g.FirstOrDefault().User.LastName}"
                        : "Unknown",
                    Email = g.FirstOrDefault() != null && g.FirstOrDefault().User != null
                        ? g.FirstOrDefault().User.Email
                        : "unknown@email.com",
                    TotalReservations = g.Count(),
                    TotalSpent = g.Sum(r => r.TotalPrice),
                    LastActivity = g.Max(r => r.CreatedAt)
                })
                .OrderByDescending(u => u.TotalReservations)
                .Take(limit)
                .ToListAsync();

            var result = new List<TopUserDto>();

            foreach (var item in reservations)
            {
                result.Add(new TopUserDto
                {
                    UserId = item.UserId,
                    UserName = item.UserName,
                    Email = item.Email,
                    TotalReservations = item.TotalReservations,
                    TotalSpent = item.TotalSpent,
                    LastActivity = item.LastActivity
                });
            }

            return result;
        }

        public async Task<List<TopSpaceDto>> GetTopSpacesAsync(int limit = 10)
        {
            var spaces = await _context.Reservations
                .Include(r => r.Space)
                .Where(r => r.Space != null)
                .GroupBy(r => r.SpaceId)
                .Select(g => new
                {
                    SpaceId = g.Key,
                    SpaceName = g.FirstOrDefault() != null && g.FirstOrDefault().Space != null
                        ? g.FirstOrDefault().Space.Name
                        : "Unknown",
                    SpaceType = g.FirstOrDefault() != null && g.FirstOrDefault().Space != null
                        ? g.FirstOrDefault().Space.Type
                        : "Unknown",
                    TotalReservations = g.Count(),
                    TotalRevenue = g.Sum(r => r.TotalPrice),
                    TotalHoursBooked = g.Sum(r => EF.Functions.DateDiffHour(r.StartTime, r.EndTime)),
                    AverageRating = g.FirstOrDefault() != null && g.FirstOrDefault().Space != null
                        ? g.FirstOrDefault().Space.AverageRating
                        : 0
                })
                .OrderByDescending(s => s.TotalReservations)
                .Take(limit)
                .ToListAsync();

            var result = new List<TopSpaceDto>();

            foreach (var item in spaces)
            {
                result.Add(new TopSpaceDto
                {
                    SpaceId = item.SpaceId,
                    SpaceName = item.SpaceName,
                    SpaceType = item.SpaceType,
                    TotalReservations = item.TotalReservations,
                    TotalRevenue = item.TotalRevenue,
                    TotalHoursBooked = item.TotalHoursBooked,
                    AverageRating = item.AverageRating
                });
            }

            return result;
        }

        public async Task<List<SpaceStatusDto>> GetSpaceStatusAsync()
        {
            var statuses = new List<SpaceStatusDto>();

            // Disponibles
            var available = await _context.Spaces
                .CountAsync(s => s.IsAvailable && s.IsActive && s.DeletedAt == null);
            statuses.Add(new SpaceStatusDto
            {
                Status = "Available",
                Count = available,
                Color = "#22c55e"
            });

            // Ocupados
            var now = DateTime.UtcNow;
            var occupied = await _context.Spaces
                .Where(s => s.IsActive && s.DeletedAt == null)
                .CountAsync(s => _context.Reservations
                    .Any(r => r.SpaceId == s.Id && r.Status == "Confirmed" && r.StartTime <= now && r.EndTime >= now));
            statuses.Add(new SpaceStatusDto
            {
                Status = "Occupied",
                Count = occupied,
                Color = "#ef4444"
            });

            // Mantenimiento (no disponibles)
            var maintenance = await _context.Spaces
                .CountAsync(s => !s.IsAvailable && s.IsActive && s.DeletedAt == null);
            statuses.Add(new SpaceStatusDto
            {
                Status = "Maintenance",
                Count = maintenance,
                Color = "#f59e0b"
            });

            // Inactivos
            var inactive = await _context.Spaces
                .CountAsync(s => !s.IsActive || s.DeletedAt != null);
            statuses.Add(new SpaceStatusDto
            {
                Status = "Inactive",
                Count = inactive,
                Color = "#6b7280"
            });

            return statuses;
        }

        public async Task<List<ReservationStatusDto>> GetReservationStatusDistributionAsync()
        {
            var statuses = await _context.Reservations
                .GroupBy(r => r.Status)
                .Select(g => new
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            var result = new List<ReservationStatusDto>();

            foreach (var item in statuses)
            {
                string color = item.Status switch
                {
                    "Confirmed" => "#22c55e",
                    "Pending" => "#f59e0b",
                    "Completed" => "#3b82f6",
                    "Cancelled" => "#ef4444",
                    _ => "#6b7280"
                };

                result.Add(new ReservationStatusDto
                {
                    Status = item.Status,
                    Count = item.Count,
                    Color = color
                });
            }

            return result;
        }

        public async Task<List<SpaceTypeDistributionDto>> GetSpaceTypeDistributionAsync()
        {
            var types = await _context.Spaces
                .Where(s => s.IsActive && s.DeletedAt == null)
                .GroupBy(s => s.Type)
                .Select(g => new
                {
                    Type = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            var result = new List<SpaceTypeDistributionDto>();

            foreach (var item in types)
            {
                string color = item.Type switch
                {
                    "Premium Office" => "#8b5cf6",
                    "Meeting Room" => "#3b82f6",
                    "Dedicated Desk" => "#22c55e",
                    "Focus Pod" => "#f59e0b",
                    "Creative Space" => "#ec4899",
                    _ => "#6b7280"
                };

                result.Add(new SpaceTypeDistributionDto
                {
                    Type = item.Type,
                    Count = item.Count,
                    Color = color
                });
            }

            return result;
        }

        public async Task<SystemHealthDto> GetSystemHealthAsync()
        {
            try
            {
                // Verificar conexión a la base de datos
                var dbOk = await _context.Database.CanConnectAsync();

                return new SystemHealthDto
                {
                    DatabaseOk = dbOk,
                    ApiOk = true,
                    Status = dbOk ? "Healthy" : "Unhealthy",
                    LastCheck = DateTime.UtcNow,
                    UptimeDays = (int)(DateTime.UtcNow - System.Diagnostics.Process.GetCurrentProcess().StartTime).TotalDays,
                    ActiveConnections = 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar salud del sistema");
                return new SystemHealthDto
                {
                    DatabaseOk = false,
                    ApiOk = false,
                    Status = "Unhealthy",
                    LastCheck = DateTime.UtcNow,
                    UptimeDays = 0,
                    ActiveConnections = 0
                };
            }
        }

        public async Task<byte[]> ExportReportAsync(DateTime startDate, DateTime endDate)
        {
            // TODO: Implementar exportación a Excel/PDF
            _logger.LogInformation("Exportando reporte de {StartDate} a {EndDate}", startDate, endDate);
            await Task.CompletedTask;
            return Array.Empty<byte>();
        }
    }
}