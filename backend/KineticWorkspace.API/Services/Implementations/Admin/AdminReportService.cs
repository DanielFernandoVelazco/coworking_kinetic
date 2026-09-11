using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Services.Interfaces.Admin;
using OfficeOpenXml;

namespace KineticWorkspace.API.Services.Implementations.Admin
{
    public class AdminReportService : IAdminReportService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminReportService> _logger;

        public AdminReportService(
            ApplicationDbContext context,
            ILogger<AdminReportService> logger)
        {
            _context = context;
            _logger = logger;
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

            using var package = new ExcelPackage();
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
    }
}