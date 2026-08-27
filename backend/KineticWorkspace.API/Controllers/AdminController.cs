// backend/KineticWorkspace.API/Controllers/AdminController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KineticWorkspace.API.Models.DTOs.Admin;
using KineticWorkspace.API.Models.DTOs.Alerts;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IAlertService _alertService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            IAdminService adminService,
            IAlertService alertService,
            ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _alertService = alertService;
            _logger = logger;
        }

        // ========== MÉTODOS EXISTENTES DE DASHBOARD ==========

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

        // ========== ✅ NUEVOS ENDPOINTS DE ALERTAS ==========

        /// <summary>
        /// Obtener todas las alertas (admin)
        /// </summary>
        [HttpGet("alerts")]
        public async Task<IActionResult> GetAllAlerts([FromQuery] bool? isRead = null, [FromQuery] int limit = 100)
        {
            try
            {
                var alerts = await _adminService.GetAllAlertsAsync(isRead, limit);
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todas las alertas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener estadísticas de alertas
        /// </summary>
        [HttpGet("alerts/stats")]
        public async Task<IActionResult> GetAlertStats()
        {
            try
            {
                var stats = await _adminService.GetAlertStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas de alertas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear alerta para todos los usuarios
        /// </summary>
        [HttpPost("alerts/broadcast")]
        public async Task<IActionResult> BroadcastAlert([FromBody] AlertRequestDto request)
        {
            try
            {
                var result = await _adminService.BroadcastAlertAsync(request);
                return Ok(new { message = $"Alerta enviada a {result} usuarios", count = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar alerta masiva");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear alerta para usuario específico (admin)
        /// </summary>
        [HttpPost("alerts/user/{userId}")]
        public async Task<IActionResult> CreateAlertForUser(int userId, [FromBody] AlertRequestDto request)
        {
            try
            {
                var alert = await _alertService.CreateAlertAsync(userId, request);
                return CreatedAtAction(nameof(GetAlertById), new { id = alert.Id }, alert);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear alerta para usuario {UserId}", userId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener alerta por ID (admin)
        /// </summary>
        [HttpGet("alerts/{id}")]
        public async Task<IActionResult> GetAlertById(int id)
        {
            try
            {
                var alert = await _adminService.GetAlertByIdAsync(id);
                if (alert == null)
                    return NotFound(new { message = "Alerta no encontrada" });

                return Ok(alert);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener alerta {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar alerta (admin)
        /// </summary>
        [HttpDelete("alerts/{id}")]
        public async Task<IActionResult> DeleteAlert(int id)
        {
            try
            {
                var result = await _adminService.DeleteAlertAsync(id);
                if (!result)
                    return NotFound(new { message = "Alerta no encontrada" });

                return Ok(new { message = "Alerta eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar alerta {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Limpiar alertas antiguas
        /// </summary>
        [HttpPost("alerts/clean")]
        public async Task<IActionResult> CleanOldAlerts([FromQuery] int daysOld = 30)
        {
            try
            {
                var count = await _alertService.CleanOldAlertsAsync(daysOld);
                return Ok(new { message = $"Se limpiaron {count} alertas antiguas", count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al limpiar alertas antiguas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}