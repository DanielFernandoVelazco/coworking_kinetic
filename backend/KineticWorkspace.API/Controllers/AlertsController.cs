// backend/KineticWorkspace.API/Controllers/AlertsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KineticWorkspace.API.Models.DTOs.Alerts;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AlertsController : ControllerBase
    {
        private readonly IAlertService _alertService;
        private readonly ILogger<AlertsController> _logger;

        public AlertsController(IAlertService alertService, ILogger<AlertsController> logger)
        {
            _alertService = alertService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todas las alertas del usuario
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAlerts([FromQuery] bool? isRead = null, [FromQuery] int limit = 50)
        {
            try
            {
                var userId = GetUserId();
                var alerts = await _alertService.GetUserAlertsAsync(userId, isRead, limit);
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener alertas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener solo alertas no leídas
        /// </summary>
        [HttpGet("unread")]
        public async Task<IActionResult> GetUnreadAlerts()
        {
            try
            {
                var userId = GetUserId();
                var alerts = await _alertService.GetUnreadAlertsAsync(userId);
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener alertas no leídas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener conteo de alertas no leídas
        /// </summary>
        [HttpGet("unread/count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var userId = GetUserId();
                var count = await _alertService.GetUnreadCountAsync(userId);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener conteo de alertas no leídas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener resumen de alertas
        /// </summary>
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            try
            {
                var userId = GetUserId();
                var summary = await _alertService.GetAlertSummaryAsync(userId);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener resumen de alertas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener alerta por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAlert(int id)
        {
            try
            {
                var userId = GetUserId();
                var alert = await _alertService.GetAlertByIdAsync(id, userId);
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
        /// Marcar alerta como leída
        /// </summary>
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var userId = GetUserId();
                var result = await _alertService.MarkAsReadAsync(id, userId);
                if (!result)
                    return NotFound(new { message = "Alerta no encontrada" });

                return Ok(new { message = "Alerta marcada como leída" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al marcar alerta como leída {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Marcar todas las alertas como leídas
        /// </summary>
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = GetUserId();
                var result = await _alertService.MarkAllAsReadAsync(userId);
                return Ok(new { message = "Todas las alertas marcadas como leídas", success = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al marcar todas las alertas como leídas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar alerta
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlert(int id)
        {
            try
            {
                var userId = GetUserId();
                var result = await _alertService.DeleteAlertAsync(id, userId);
                if (!result)
                    return NotFound(new { message = "Alerta no encontrada" });

                return Ok(new { message = "Alerta eliminada" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar alerta {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar todas las alertas leídas
        /// </summary>
        [HttpDelete("read")]
        public async Task<IActionResult> DeleteAllRead()
        {
            try
            {
                var userId = GetUserId();
                var result = await _alertService.DeleteAllReadAsync(userId);
                return Ok(new { message = "Alertas leídas eliminadas", success = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar alertas leídas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear alerta (sistema - solo admin)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAlert([FromBody] AlertRequestDto request)
        {
            try
            {
                var userId = GetUserId();
                var alert = await _alertService.CreateAlertAsync(userId, request);
                return CreatedAtAction(nameof(GetAlert), new { id = alert.Id }, alert);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear alerta");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear alerta para usuario específico (sistema - solo admin)
        /// </summary>
        [HttpPost("user/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAlertForUser(int userId, [FromBody] AlertRequestDto request)
        {
            try
            {
                var alert = await _alertService.CreateAlertAsync(userId, request);
                return CreatedAtAction(nameof(GetAlert), new { id = alert.Id }, alert);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear alerta para usuario {UserId}", userId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Limpiar alertas antiguas (sistema - solo admin)
        /// </summary>
        [HttpPost("clean")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CleanOldAlerts([FromQuery] int daysOld = 30)
        {
            try
            {
                var count = await _alertService.CleanOldAlertsAsync(daysOld);
                return Ok(new { message = $"Se limpiaron {count} alertas antiguas" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al limpiar alertas antiguas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("Usuario no autenticado");
            return int.Parse(userIdClaim);
        }
    }
}