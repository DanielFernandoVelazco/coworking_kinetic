using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KineticWorkspace.API.Models.DTOs.Reservations;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReservationsController : ControllerBase
    {
        private readonly IReservationService _reservationService;
        private readonly ILogger<ReservationsController> _logger;

        public ReservationsController(IReservationService reservationService, ILogger<ReservationsController> logger)
        {
            _reservationService = reservationService;
            _logger = logger;
        }

        // VERIFICAR ÚLTIMA RESERVA

        [HttpGet("latest")]
        [Authorize]
        public async Task<IActionResult> GetLatestReservation()
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var reservations = await _reservationService.GetUserReservationsAsync(userId);
                var latest = reservations.OrderByDescending(r => r.CreatedAt).FirstOrDefault();

                if (latest == null)
                    return NotFound(new { message = "No se encontraron reservas" });

                return Ok(latest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener última reserva");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // Endpoint con filtros y ordenamiento
        [HttpGet("user/filtered")]
        public async Task<IActionResult> GetUserReservationsFiltered(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? sortBy = "date_desc",
            [FromQuery] string? status = "all")
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var result = await _reservationService.GetUserReservationsFilteredAsync(userId, page, pageSize, sortBy, status);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener reservaciones del usuario con filtros");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // Endpoint original (se mantiene por compatibilidad)
        [HttpGet("user")]
        public async Task<IActionResult> GetUserReservations()
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var reservations = await _reservationService.GetUserReservationsAsync(userId);
                return Ok(reservations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener reservaciones del usuario");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("user/upcoming")]
        public async Task<IActionResult> GetUpcomingReservations([FromQuery] int limit = 10)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var reservations = await _reservationService.GetUpcomingReservationsAsync(userId, limit);
                return Ok(reservations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener reservaciones próximas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("user/summary")]
        public async Task<IActionResult> GetReservationSummary()
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var summary = await _reservationService.GetReservationSummaryAsync(userId);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener resumen de reservaciones");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("space/{spaceId}")]
        public async Task<IActionResult> GetSpaceReservations(int spaceId)
        {
            try
            {
                var reservations = await _reservationService.GetSpaceReservationsAsync(spaceId);
                return Ok(reservations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener reservaciones del espacio: {SpaceId}", spaceId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("active")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetActiveReservations()
        {
            try
            {
                var reservations = await _reservationService.GetActiveReservationsAsync();
                return Ok(reservations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener reservaciones activas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReservationById(int id)
        {
            try
            {
                var reservation = await _reservationService.GetReservationByIdAsync(id);
                if (reservation == null)
                    return NotFound(new { message = $"Reservación con ID {id} no encontrada" });

                return Ok(reservation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener reservación por ID: {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationRequestDto request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var reservation = await _reservationService.CreateReservationAsync(request, userId);
                return CreatedAtAction(nameof(GetReservationById), new { id = reservation.Id }, reservation);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear reservación");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReservation(int id, [FromBody] ReservationRequestDto request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var reservation = await _reservationService.UpdateReservationAsync(id, request, userId);
                if (reservation == null)
                    return NotFound(new { message = $"Reservación con ID {id} no encontrada" });

                return Ok(reservation);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar reservación: {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelReservation(int id, [FromBody] CancelReservationRequestDto request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var result = await _reservationService.CancelReservationAsync(id, userId, request.Reason);
                if (!result)
                    return NotFound(new { message = $"Reservación con ID {id} no encontrada o no se puede cancelar" });

                return Ok(new { message = "Reservación cancelada exitosamente" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cancelar reservación: {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost("{id}/confirm")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ConfirmReservation(int id)
        {
            try
            {
                var adminUserId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var result = await _reservationService.ConfirmReservationAsync(id, adminUserId);
                if (!result)
                    return NotFound(new { message = $"Reservación con ID {id} no encontrada" });

                return Ok(new { message = "Reservación confirmada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al confirmar reservación: {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// Obtener TODAS las reservas con filtros (SOLO ADMIN)

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllReservationsFiltered(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15,
            [FromQuery] string? sortBy = "date_desc",
            [FromQuery] string? status = "all",
            [FromQuery] string? search = null,
            [FromQuery] int? userId = null,
            [FromQuery] int? spaceId = null)
        {
            try
            {
                var result = await _reservationService.GetAllReservationsFilteredAsync(
                    page, pageSize, sortBy, status, search, userId, spaceId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todas las reservas (admin)");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}