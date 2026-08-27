// backend/KineticWorkspace.API/Services/Implementations/AdminService.cs
using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.DTOs.Admin;
using KineticWorkspace.API.Models.DTOs.Alerts;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Services.Interfaces;
using OfficeOpenXml;

namespace KineticWorkspace.API.Services.Implementations
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminService> _logger;
        private readonly IAlertService _alertService;

        public AdminService(
            ApplicationDbContext context,
            ILogger<AdminService> logger,
            IAlertService alertService)
        {
            _context = context;
            _logger = logger;
            _alertService = alertService;
        }

        // ========== MÉTODOS DEL DASHBOARD ==========

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

                var totalRevenue = await _context.Payments
                    .Where(p => p.Status == "Completed")
                    .SumAsync(p => (decimal?)p.Amount) ?? 0m;

                var monthlyRevenue = await _context.Payments
                    .Where(p => p.Status == "Completed" && p.CreatedAt >= startOfMonth)
                    .SumAsync(p => (decimal?)p.Amount) ?? 0m;

                var averageRevenuePerBooking = totalReservations > 0
                    ? totalRevenue / totalReservations
                    : 0m;

                // Tasa de ocupación
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
            var now = DateTime.UtcNow;

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

            // Mantenimiento
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
            _logger.LogInformation("Exportando reporte de {StartDate} a {EndDate}", startDate, endDate);

            var reservations = await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Space)
                .Include(r => r.Payments)
                .Where(r => r.CreatedAt >= startDate && r.CreatedAt <= endDate)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var users = await _context.Users
                .Where(u => u.CreatedAt >= startDate && u.CreatedAt <= endDate && u.DeletedAt == null)
                .ToListAsync();

            var spaces = await _context.Spaces
                .Where(s => s.CreatedAt >= startDate && s.CreatedAt <= endDate && s.DeletedAt == null)
                .ToListAsync();

            using var package = new OfficeOpenXml.ExcelPackage();
            var workbook = package.Workbook;

            // Hoja de Resumen
            var summarySheet = workbook.Worksheets.Add("Resumen");
            summarySheet.Cells["A1"].Value = "KINETIC WORKSPACE - REPORTE DE ACTIVIDAD";
            summarySheet.Cells["A1"].Style.Font.Size = 16;
            summarySheet.Cells["A1"].Style.Font.Bold = true;
            summarySheet.Cells["A1:D1"].Merge = true;

            summarySheet.Cells["A3"].Value = "Período:";
            summarySheet.Cells["B3"].Value = $"{startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}";
            summarySheet.Cells["A4"].Value = "Fecha de generación:";
            summarySheet.Cells["B4"].Value = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss");

            int row = 6;
            summarySheet.Cells[$"A{row}"].Value = "MÉTRICAS GENERALES";
            summarySheet.Cells[$"A{row}:C{row}"].Merge = true;
            summarySheet.Cells[$"A{row}"].Style.Font.Bold = true;
            row += 2;

            var totalRevenue = reservations.Where(r => r.Status == "Completed").Sum(r => r.TotalPrice);
            var totalReservations = reservations.Count;
            var activeReservations = reservations.Count(r => r.Status == "Confirmed");
            var pendingReservations = reservations.Count(r => r.Status == "Pending");
            var completedReservations = reservations.Count(r => r.Status == "Completed");
            var cancelledReservations = reservations.Count(r => r.Status == "Cancelled");
            var newUsers = users.Count;
            var newSpaces = spaces.Count;

            var metrics = new[]
            {
                new { Label = "Total Reservas", Value = totalReservations.ToString() },
                new { Label = "Activas", Value = activeReservations.ToString() },
                new { Label = "Pendientes", Value = pendingReservations.ToString() },
                new { Label = "Completadas", Value = completedReservations.ToString() },
                new { Label = "Canceladas", Value = cancelledReservations.ToString() },
                new { Label = "Ingresos Totales", Value = $"${totalRevenue:N2}" },
                new { Label = "Nuevos Usuarios", Value = newUsers.ToString() },
                new { Label = "Nuevos Espacios", Value = newSpaces.ToString() },
            };

            foreach (var metric in metrics)
            {
                summarySheet.Cells[$"A{row}"].Value = metric.Label;
                summarySheet.Cells[$"B{row}"].Value = metric.Value;
                summarySheet.Cells[$"A{row}"].Style.Font.Bold = true;
                row++;
            }

            summarySheet.Column(1).Width = 25;
            summarySheet.Column(2).Width = 20;

            // Hoja de Reservas
            var reservationsSheet = workbook.Worksheets.Add("Reservas");
            var headers = new[] { "ID", "Usuario", "Email", "Espacio", "Tipo", "Inicio", "Fin", "Invitados", "Total", "Estado", "Creación" };
            for (int i = 0; i < headers.Length; i++)
            {
                reservationsSheet.Cells[1, i + 1].Value = headers[i];
                reservationsSheet.Cells[1, i + 1].Style.Font.Bold = true;
                reservationsSheet.Cells[1, i + 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                reservationsSheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
            }

            int dataRow = 2;
            foreach (var r in reservations)
            {
                reservationsSheet.Cells[dataRow, 1].Value = r.Id;
                reservationsSheet.Cells[dataRow, 2].Value = r.User != null ? $"{r.User.FirstName} {r.User.LastName}" : "N/A";
                reservationsSheet.Cells[dataRow, 3].Value = r.User?.Email ?? "N/A";
                reservationsSheet.Cells[dataRow, 4].Value = r.Space?.Name ?? "N/A";
                reservationsSheet.Cells[dataRow, 5].Value = r.Space?.Type ?? "N/A";
                reservationsSheet.Cells[dataRow, 6].Value = r.StartTime.ToString("dd/MM/yyyy HH:mm");
                reservationsSheet.Cells[dataRow, 7].Value = r.EndTime.ToString("dd/MM/yyyy HH:mm");
                reservationsSheet.Cells[dataRow, 8].Value = r.NumberOfGuests ?? 1;
                reservationsSheet.Cells[dataRow, 9].Value = r.TotalPrice;
                reservationsSheet.Cells[dataRow, 9].Style.Numberformat.Format = "$#,##0.00";
                reservationsSheet.Cells[dataRow, 10].Value = r.Status;
                reservationsSheet.Cells[dataRow, 11].Value = r.CreatedAt.ToString("dd/MM/yyyy HH:mm");
                dataRow++;
            }

            reservationsSheet.Cells[1, 1, dataRow - 1, 11].AutoFitColumns();

            // Hoja de Reservas Mensuales
            var monthlySheet = workbook.Worksheets.Add("Reservas Mensuales");
            var monthlyHeaders = new[] { "Mes", "Reservas", "Ingresos", "Promedio" };
            for (int i = 0; i < monthlyHeaders.Length; i++)
            {
                monthlySheet.Cells[1, i + 1].Value = monthlyHeaders[i];
                monthlySheet.Cells[1, i + 1].Style.Font.Bold = true;
                monthlySheet.Cells[1, i + 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                monthlySheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
            }

            var monthlyData = reservations
                .GroupBy(r => new { r.CreatedAt.Year, r.CreatedAt.Month })
                .Select(g => new
                {
                    Month = $"{g.Key.Month:00}/{g.Key.Year}",
                    Count = g.Count(),
                    Revenue = g.Where(r => r.Status == "Completed").Sum(r => r.TotalPrice),
                    Avg = g.Where(r => r.Status == "Completed").Any()
                        ? g.Where(r => r.Status == "Completed").Average(r => r.TotalPrice)
                        : 0
                })
                .OrderBy(g => g.Month)
                .ToList();

            int monthlyRow = 2;
            foreach (var item in monthlyData)
            {
                monthlySheet.Cells[monthlyRow, 1].Value = item.Month;
                monthlySheet.Cells[monthlyRow, 2].Value = item.Count;
                monthlySheet.Cells[monthlyRow, 3].Value = item.Revenue;
                monthlySheet.Cells[monthlyRow, 3].Style.Numberformat.Format = "$#,##0.00";
                monthlySheet.Cells[monthlyRow, 4].Value = item.Avg;
                monthlySheet.Cells[monthlyRow, 4].Style.Numberformat.Format = "$#,##0.00";
                monthlyRow++;
            }

            monthlySheet.Cells[1, 1, monthlyRow - 1, 4].AutoFitColumns();

            // Hoja de Usuarios
            if (users.Any())
            {
                var usersSheet = workbook.Worksheets.Add("Usuarios");
                var userHeaders = new[] { "ID", "Nombre", "Email", "Empresa", "Rol", "Registro" };
                for (int i = 0; i < userHeaders.Length; i++)
                {
                    usersSheet.Cells[1, i + 1].Value = userHeaders[i];
                    usersSheet.Cells[1, i + 1].Style.Font.Bold = true;
                    usersSheet.Cells[1, i + 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    usersSheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                }

                int userRow = 2;
                foreach (var u in users)
                {
                    usersSheet.Cells[userRow, 1].Value = u.Id;
                    usersSheet.Cells[userRow, 2].Value = $"{u.FirstName} {u.LastName}";
                    usersSheet.Cells[userRow, 3].Value = u.Email;
                    usersSheet.Cells[userRow, 4].Value = u.Company ?? "N/A";
                    usersSheet.Cells[userRow, 5].Value = u.IsAdmin ? "Admin" : "Usuario";
                    usersSheet.Cells[userRow, 6].Value = u.CreatedAt.ToString("dd/MM/yyyy");
                    userRow++;
                }

                usersSheet.Cells[1, 1, userRow - 1, 6].AutoFitColumns();
            }

            // Hoja de Espacios
            if (spaces.Any())
            {
                var spacesSheet = workbook.Worksheets.Add("Espacios");
                var spaceHeaders = new[] { "ID", "Nombre", "Tipo", "Ciudad", "Capacidad", "Precio/hora", "Precio/día", "Creado" };
                for (int i = 0; i < spaceHeaders.Length; i++)
                {
                    spacesSheet.Cells[1, i + 1].Value = spaceHeaders[i];
                    spacesSheet.Cells[1, i + 1].Style.Font.Bold = true;
                    spacesSheet.Cells[1, i + 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    spacesSheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                }

                int spaceRow = 2;
                foreach (var s in spaces)
                {
                    spacesSheet.Cells[spaceRow, 1].Value = s.Id;
                    spacesSheet.Cells[spaceRow, 2].Value = s.Name;
                    spacesSheet.Cells[spaceRow, 3].Value = s.Type;
                    spacesSheet.Cells[spaceRow, 4].Value = s.City;
                    spacesSheet.Cells[spaceRow, 5].Value = s.Capacity;
                    spacesSheet.Cells[spaceRow, 6].Value = s.PricePerHour;
                    spacesSheet.Cells[spaceRow, 6].Style.Numberformat.Format = "$#,##0.00";
                    spacesSheet.Cells[spaceRow, 7].Value = s.PricePerDay ?? 0;
                    spacesSheet.Cells[spaceRow, 7].Style.Numberformat.Format = "$#,##0.00";
                    spacesSheet.Cells[spaceRow, 8].Value = s.CreatedAt.ToString("dd/MM/yyyy");
                    spaceRow++;
                }

                spacesSheet.Cells[1, 1, spaceRow - 1, 8].AutoFitColumns();
            }

            return await Task.FromResult(package.GetAsByteArray());
        }

        // ========== ✅ NUEVOS MÉTODOS DE ALERTAS ==========

        public async Task<IEnumerable<AlertResponseDto>> GetAllAlertsAsync(bool? isRead = null, int limit = 100)
        {
            var query = _context.Alerts
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .AsQueryable();

            if (isRead.HasValue)
            {
                query = query.Where(a => a.IsRead == isRead.Value);
            }

            var alerts = await query.Take(limit).ToListAsync();

            return alerts.Select(a => new AlertResponseDto
            {
                Id = a.Id,
                UserId = a.UserId,
                Title = a.Title,
                Message = a.Message,
                Type = a.Type,
                Category = a.Category,
                IsRead = a.IsRead,
                ActionUrl = a.ActionUrl,
                ActionLabel = a.ActionLabel,
                CreatedAt = a.CreatedAt,
                ReadAt = a.ReadAt,
                UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : "Unknown",
                UserEmail = a.User?.Email ?? "unknown@email.com",
                TimeAgo = GetTimeAgo(a.CreatedAt)
            });
        }

        public async Task<AlertStatsDto> GetAlertStatsAsync()
        {
            var total = await _context.Alerts.CountAsync();
            var unread = await _context.Alerts.CountAsync(a => !a.IsRead);
            var read = await _context.Alerts.CountAsync(a => a.IsRead);

            var byType = await _context.Alerts
                .GroupBy(a => a.Type)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.Type, g => g.Count);

            var byCategory = await _context.Alerts
                .GroupBy(a => a.Category)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.Category, g => g.Count);

            var last7Days = await _context.Alerts
                .Where(a => a.CreatedAt >= DateTime.UtcNow.AddDays(-7))
                .CountAsync();

            var dailyTrend = new List<DailyAlertCount>();
            for (int i = 6; i >= 0; i--)
            {
                var date = DateTime.UtcNow.AddDays(-i).Date;
                var count = await _context.Alerts
                    .Where(a => a.CreatedAt.Date == date)
                    .CountAsync();
                dailyTrend.Add(new DailyAlertCount
                {
                    Date = date,
                    Count = count
                });
            }

            return new AlertStatsDto
            {
                Total = total,
                Unread = unread,
                Read = read,
                ByType = byType,
                ByCategory = byCategory,
                Last7Days = last7Days,
                DailyTrend = dailyTrend
            };
        }

        public async Task<int> BroadcastAlertAsync(AlertRequestDto request)
        {
            var users = await _context.Users
                .Where(u => u.IsActive && u.DeletedAt == null)
                .ToListAsync();

            var alerts = new List<Alert>();
            foreach (var user in users)
            {
                alerts.Add(new Alert
                {
                    UserId = user.Id,
                    Title = request.Title,
                    Message = request.Message,
                    Type = request.Type,
                    Category = request.Category,
                    ActionUrl = request.ActionUrl,
                    ActionLabel = request.ActionLabel,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.Alerts.AddRangeAsync(alerts);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Alerta masiva enviada a {users.Count} usuarios: {request.Title}");

            return users.Count;
        }

        public async Task<AlertResponseDto?> GetAlertByIdAsync(int id)
        {
            var alert = await _context.Alerts
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (alert == null) return null;

            return new AlertResponseDto
            {
                Id = alert.Id,
                UserId = alert.UserId,
                Title = alert.Title,
                Message = alert.Message,
                Type = alert.Type,
                Category = alert.Category,
                IsRead = alert.IsRead,
                ActionUrl = alert.ActionUrl,
                ActionLabel = alert.ActionLabel,
                CreatedAt = alert.CreatedAt,
                ReadAt = alert.ReadAt,
                UserName = alert.User != null ? $"{alert.User.FirstName} {alert.User.LastName}" : "Unknown",
                UserEmail = alert.User?.Email ?? "unknown@email.com",
                TimeAgo = GetTimeAgo(alert.CreatedAt)
            };
        }

        public async Task<bool> DeleteAlertAsync(int id)
        {
            var alert = await _context.Alerts.FindAsync(id);
            if (alert == null) return false;

            _context.Alerts.Remove(alert);
            await _context.SaveChangesAsync();
            return true;
        }

        // ========== MÉTODOS AUXILIARES ==========

        private string GetTimeAgo(DateTime dateTime)
        {
            var diff = DateTime.UtcNow - dateTime;

            if (diff.TotalMinutes < 1) return "Just now";
            if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes}m ago";
            if (diff.TotalHours < 24) return $"{(int)diff.TotalHours}h ago";
            if (diff.TotalDays < 7) return $"{(int)diff.TotalDays}d ago";
            if (diff.TotalDays < 30) return $"{(int)(diff.TotalDays / 7)}w ago";
            if (diff.TotalDays < 365) return $"{(int)(diff.TotalDays / 30)}mo ago";
            return $"{(int)(diff.TotalDays / 365)}y ago";
        }
    }
}