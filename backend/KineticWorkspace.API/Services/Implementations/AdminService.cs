// backend/KineticWorkspace.API/Services/Implementations/AdminService.cs
using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.DTOs.Admin;
using KineticWorkspace.API.Services.Interfaces;
using OfficeOpenXml;

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

        // método ExportReportAsync

        public async Task<byte[]> ExportReportAsync(DateTime startDate, DateTime endDate)
        {
            _logger.LogInformation("Exportando reporte de {StartDate} a {EndDate}", startDate, endDate);

            // 1. Obtener datos para el reporte
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

            // 2. Crear el archivo Excel
            using var package = new OfficeOpenXml.ExcelPackage();
            var workbook = package.Workbook;

            // ========== HOJA 1: RESUMEN ==========
            var summarySheet = workbook.Worksheets.Add("Resumen");
            summarySheet.Cells["A1"].Value = "KINETIC WORKSPACE - REPORTE DE ACTIVIDAD";
            summarySheet.Cells["A1"].Style.Font.Size = 16;
            summarySheet.Cells["A1"].Style.Font.Bold = true;
            summarySheet.Cells["A1:D1"].Merge = true;

            summarySheet.Cells["A3"].Value = "Período:";
            summarySheet.Cells["B3"].Value = $"{startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}";
            summarySheet.Cells["A4"].Value = "Fecha de generación:";
            summarySheet.Cells["B4"].Value = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss");

            // Métricas
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

            // Dar formato a la hoja de resumen
            summarySheet.Column(1).Width = 25;
            summarySheet.Column(2).Width = 20;

            // ========== HOJA 2: RESERVAS ==========
            var reservationsSheet = workbook.Worksheets.Add("Reservas");

            // Headers
            var headers = new[] { "ID", "Usuario", "Email", "Espacio", "Tipo", "Inicio", "Fin", "Invitados", "Total", "Estado", "Creación" };
            for (int i = 0; i < headers.Length; i++)
            {
                reservationsSheet.Cells[1, i + 1].Value = headers[i];
                reservationsSheet.Cells[1, i + 1].Style.Font.Bold = true;
                reservationsSheet.Cells[1, i + 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                reservationsSheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
            }

            // Datos
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

            // Autoajustar columnas
            reservationsSheet.Cells[1, 1, dataRow - 1, 11].AutoFitColumns();

            // ========== HOJA 3: RESERVAS MENSUALES ==========
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

            // ========== HOJA 4: USUARIOS ==========
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

            // ========== HOJA 5: ESPACIOS ==========
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

            // 3. Retornar el archivo como byte array
            return await Task.FromResult(package.GetAsByteArray());
        }
    }
}