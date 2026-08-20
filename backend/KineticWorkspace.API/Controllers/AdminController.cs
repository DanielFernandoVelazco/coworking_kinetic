// backend/KineticWorkspace.API/Controllers/AdminController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IAdminService adminService, ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todos los datos del dashboard
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var data = await _adminService.GetDashboardDataAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener datos del dashboard");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener métricas resumidas
        /// </summary>
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            try
            {
                var data = await _adminService.GetSummaryMetricsAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener métricas resumidas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener reservas mensuales
        /// </summary>
        [HttpGet("monthly-reservations")]
        public async Task<IActionResult> GetMonthlyReservations([FromQuery] int months = 12)
        {
            try
            {
                var data = await _adminService.GetMonthlyReservationsAsync(months);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener reservas mensuales");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener ingresos mensuales
        /// </summary>
        [HttpGet("monthly-revenue")]
        public async Task<IActionResult> GetMonthlyRevenue([FromQuery] int months = 12)
        {
            try
            {
                var data = await _adminService.GetMonthlyRevenueAsync(months);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener ingresos mensuales");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener reservas recientes
        /// </summary>
        [HttpGet("recent-reservations")]
        public async Task<IActionResult> GetRecentReservations([FromQuery] int limit = 10)
        {
            try
            {
                var data = await _adminService.GetRecentReservationsAsync(limit);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener reservas recientes");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener top usuarios
        /// </summary>
        [HttpGet("top-users")]
        public async Task<IActionResult> GetTopUsers([FromQuery] int limit = 10)
        {
            try
            {
                var data = await _adminService.GetTopUsersAsync(limit);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener top usuarios");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener top espacios
        /// </summary>
        [HttpGet("top-spaces")]
        public async Task<IActionResult> GetTopSpaces([FromQuery] int limit = 10)
        {
            try
            {
                var data = await _adminService.GetTopSpacesAsync(limit);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener top espacios");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener estado del sistema
        /// </summary>
        [HttpGet("health")]
        public async Task<IActionResult> GetSystemHealth()
        {
            try
            {
                var data = await _adminService.GetSystemHealthAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estado del sistema");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Exportar reporte
        /// </summary>
        [HttpGet("export")]
        public async Task<IActionResult> ExportReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
                var end = endDate ?? DateTime.UtcNow;

                var data = await _adminService.ExportReportAsync(start, end);
                return File(data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"Reporte_{start:yyyyMMdd}_{end:yyyyMMdd}.xlsx");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al exportar reporte");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}