// backend/KineticWorkspace.API/Controllers/PreReservationsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KineticWorkspace.API.Models.DTOs.PreReservations;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PreReservationsController : ControllerBase
    {
        private readonly IPreReservationService _preReservationService;
        private readonly ILogger<PreReservationsController> _logger;

        public PreReservationsController(IPreReservationService preReservationService, ILogger<PreReservationsController> logger)
        {
            _preReservationService = preReservationService;
            _logger = logger;
        }

        /// <summary>
        /// Crear una pre-reserva (carrito)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreatePreReservation([FromBody] PreReservationRequestDto request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var result = await _preReservationService.CreatePreReservationAsync(request, userId);
                return CreatedAtAction(nameof(GetPreReservation), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear pre-reserva");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener pre-reserva por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPreReservation(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var result = await _preReservationService.GetPreReservationByIdAsync(id, userId);
                if (result == null)
                    return NotFound(new { message = "Pre-reserva no encontrada" });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener pre-reserva {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener todas las pre-reservas del usuario (carrito activo)
        /// </summary>
        [HttpGet("user")]
        public async Task<IActionResult> GetUserPreReservations([FromQuery] string? status = null)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var result = await _preReservationService.GetUserPreReservationsAsync(userId, status);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener pre-reservas del usuario");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener carrito activo por sessionId
        /// </summary>
        [HttpGet("cart/{sessionId}")]
        public async Task<IActionResult> GetActiveCart(string sessionId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var result = await _preReservationService.GetActiveCartBySessionIdAsync(sessionId, userId);
                if (result == null)
                    return NotFound(new { message = "No hay carrito activo para esta sesión" });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener carrito por sessionId {SessionId}", sessionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Procesar pago de la pre-reserva
        /// </summary>
        [HttpPost("payment")]
        public async Task<IActionResult> ProcessPayment([FromBody] PreReservationPaymentRequestDto request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var result = await _preReservationService.ProcessPaymentAsync(request, userId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar pago");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Confirmar pago y convertir en reserva definitiva
        /// </summary>
        [HttpPost("confirm")]
        public async Task<IActionResult> ConfirmPayment([FromBody] PreReservationConfirmRequestDto request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var result = await _preReservationService.ConfirmPaymentAsync(request, userId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al confirmar pago");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Cancelar pre-reserva
        /// </summary>
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelPreReservation(int id, [FromBody] string? reason = null)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var result = await _preReservationService.CancelPreReservationAsync(id, userId, reason);
                if (!result)
                    return NotFound(new { message = "Pre-reserva no encontrada" });

                return Ok(new { message = "Pre-reserva cancelada exitosamente" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cancelar pre-reserva {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Limpiar pre-reservas expiradas (endpoint para tarea programada)
        /// </summary>
        [HttpPost("clean-expired")]
        public async Task<IActionResult> CleanExpired()
        {
            try
            {
                var count = await _preReservationService.CleanExpiredPreReservationsAsync();
                return Ok(new { message = $"Se limpiaron {count} pre-reservas expiradas" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al limpiar pre-reservas expiradas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}