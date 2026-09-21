using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.DTOs.Admin;
using KineticWorkspace.API.Services.Interfaces.Admin;

namespace KineticWorkspace.API.Services.Implementations.Admin
{
    public class AdminDashboardService : IAdminDashboardService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminDashboardService> _logger;

        public AdminDashboardService(
            ApplicationDbContext context,
            ILogger<AdminDashboardService> logger)
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

                var totalUsers = await _context.Users.CountAsync(u => u.DeletedAt == null);
                var activeUsers = await _context.Users.CountAsync(u => u.IsActive && u.DeletedAt == null);
                var newUsersThisMonth = await _context.Users
                    .CountAsync(u => u.CreatedAt >= startOfMonth && u.DeletedAt == null);

                var totalSpaces = await _context.Spaces.CountAsync(s => s.DeletedAt == null);
                var availableSpaces = await _context.Spaces
                    .CountAsync(s => s.IsAvailable && s.IsActive && s.DeletedAt == null);

                var totalReservations = await _context.Reservations.CountAsync();
                var activeReservations = await _context.Reservations
                    .CountAsync(r => r.Status == "Confirmed" && r.StartTime <= now && r.EndTime >= now);
                var pendingReservations = await _context.Reservations
                    .CountAsync(r => r.Status == "Pending");
                var completedReservations = await _context.Reservations
                    .CountAsync(r => r.Status == "Completed");
                var cancelledReservations = await _context.Reservations
                    .CountAsync(r => r.Status == "Cancelled");

                var totalRevenue = await _context.Payments
                    .Where(p => p.Status == "Completed")
                    .SumAsync(p => (decimal?)p.Amount) ?? 0m;

                var monthlyRevenue = await _context.Payments
                    .Where(p => p.Status == "Completed" && p.CreatedAt >= startOfMonth)
                    .SumAsync(p => (decimal?)p.Amount) ?? 0m;

                var averageRevenuePerBooking = totalReservations > 0
                    ? totalRevenue / totalReservations
                    : 0m;

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
            // ✅ FIX: separar agregación (SQL) de enriquecimiento (memoria).
            // EF no traduce g.FirstOrDefault().User.X dentro de un GroupBy.

            // 1. Agregación pura — traducible a SQL
            var aggregates = await _context.Reservations
                .Where(r => r.UserId > 0)
                .GroupBy(r => r.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    TotalReservations = g.Count(),
                    TotalSpent = g.Sum(r => r.TotalPrice),
                    LastActivity = g.Max(r => r.CreatedAt)
                })
                .OrderByDescending(x => x.TotalReservations)
                .Take(limit)
                .ToListAsync();

            if (!aggregates.Any())
                return new List<TopUserDto>();

            // 2. Traer datos descriptivos de los usuarios involucrados
            var userIds = aggregates.Select(a => a.UserId).ToList();

            var users = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Email
                })
                .ToDictionaryAsync(u => u.Id);

            // 3. Merge en memoria
            var result = aggregates
                .Select(a =>
                {
                    users.TryGetValue(a.UserId, out var user);
                    return new TopUserDto
                    {
                        UserId = a.UserId,
                        UserName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown",
                        Email = user?.Email ?? "unknown@email.com",
                        TotalReservations = a.TotalReservations,
                        TotalSpent = a.TotalSpent,
                        LastActivity = a.LastActivity
                    };
                })
                .ToList();

            return result;
        }

        public async Task<List<TopSpaceDto>> GetTopSpacesAsync(int limit = 10)
        {
            // ✅ FIX: mismo patrón que GetTopUsersAsync.

            // 1. Agregación pura
            var aggregates = await _context.Reservations
                .Where(r => r.SpaceId > 0)
                .GroupBy(r => r.SpaceId)
                .Select(g => new
                {
                    SpaceId = g.Key,
                    TotalReservations = g.Count(),
                    TotalRevenue = g.Sum(r => r.TotalPrice),
                    // ✅ FIX: DateDiffHour no es portable con Pomelo.
                    // Sumamos en .NET después de traer los timestamps (ver paso 2b).
                })
                .OrderByDescending(x => x.TotalReservations)
                .Take(limit)
                .ToListAsync();

            if (!aggregates.Any())
                return new List<TopSpaceDto>();

            var spaceIds = aggregates.Select(a => a.SpaceId).ToList();

            // 2a. Datos descriptivos de los espacios
            var spaces = await _context.Spaces
                .Where(s => spaceIds.Contains(s.Id))
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Type
                })
                .ToDictionaryAsync(s => s.Id);

            // 2b. Calcular TotalHoursBooked y AverageRating por separado.
            // Traemos las reservas involucradas (solo los campos necesarios)
            // y calculamos en memoria. Son a lo sumo `limit` espacios * N reservas.
            var reservationData = await _context.Reservations
                .Where(r => spaceIds.Contains(r.SpaceId))
                .Select(r => new
                {
                    r.SpaceId,
                    r.StartTime,
                    r.EndTime
                })
                .ToListAsync();

            var hoursBySpace = reservationData
                .GroupBy(r => r.SpaceId)
                .ToDictionary(
                    g => g.Key,
                    g => (int)g.Sum(r => (r.EndTime - r.StartTime).TotalHours));

            // 3. Ratings — query separada para no mezclar agregados
            var ratingsBySpace = await _context.Reviews
                .Where(r => spaceIds.Contains(r.SpaceId))
                .GroupBy(r => r.SpaceId)
                .Select(g => new
                {
                    SpaceId = g.Key,
                    AverageRating = g.Average(r => (double)r.Rating)
                })
                .ToDictionaryAsync(x => x.SpaceId, x => x.AverageRating);

            // 4. Merge en memoria
            var result = aggregates
                .Select(a =>
                {
                    spaces.TryGetValue(a.SpaceId, out var space);
                    return new TopSpaceDto
                    {
                        SpaceId = a.SpaceId,
                        SpaceName = space?.Name ?? "Unknown",
                        SpaceType = space?.Type ?? "Unknown",
                        TotalReservations = a.TotalReservations,
                        TotalRevenue = a.TotalRevenue,
                        TotalHoursBooked = hoursBySpace.TryGetValue(a.SpaceId, out var h) ? h : 0,
                        AverageRating = ratingsBySpace.TryGetValue(a.SpaceId, out var r) ? r : 0
                    };
                })
                .ToList();

            return result;
        }

        public async Task<SystemHealthDto> GetSystemHealthAsync()
        {
            try
            {
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

        // ========== HELPERS PRIVADOS DEL DASHBOARD ==========

        private async Task<List<SpaceStatusDto>> GetSpaceStatusAsync()
        {
            var statuses = new List<SpaceStatusDto>();
            var now = DateTime.UtcNow;

            var available = await _context.Spaces
                .CountAsync(s => s.IsAvailable && s.IsActive && s.DeletedAt == null);
            statuses.Add(new SpaceStatusDto
            {
                Status = "Available",
                Count = available,
                Color = "#22c55e"
            });

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

            var maintenance = await _context.Spaces
                .CountAsync(s => !s.IsAvailable && s.IsActive && s.DeletedAt == null);
            statuses.Add(new SpaceStatusDto
            {
                Status = "Maintenance",
                Count = maintenance,
                Color = "#f59e0b"
            });

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

        private async Task<List<ReservationStatusDto>> GetReservationStatusDistributionAsync()
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

        private async Task<List<SpaceTypeDistributionDto>> GetSpaceTypeDistributionAsync()
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
    }
}