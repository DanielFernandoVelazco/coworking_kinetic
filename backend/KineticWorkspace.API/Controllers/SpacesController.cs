// backend/KineticWorkspace.API/Controllers/SpacesController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KineticWorkspace.API.Models.DTOs.Spaces;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpacesController : ControllerBase
    {
        private readonly ISpaceService _spaceService;
        private readonly ILogger<SpacesController> _logger;

        public SpacesController(ISpaceService spaceService, ILogger<SpacesController> logger)
        {
            _spaceService = spaceService;
            _logger = logger;
        }

        // ✅ Endpoint público - Sin paginación (para el frontend)
        [HttpGet("all")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllSpacesUnpaginated()
        {
            try
            {
                var spaces = await _spaceService.GetAllSpacesUnpaginatedAsync();
                return Ok(spaces);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los espacios sin paginación");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ✅ Endpoint público - No requiere autenticación
        [HttpGet("featured")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFeaturedSpaces([FromQuery] int limit = 10)
        {
            try
            {
                var spaces = await _spaceService.GetFeaturedSpacesAsync(limit);
                return Ok(spaces);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener espacios destacados");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ✅ Endpoint público - No requiere autenticación
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllSpaces(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 100) // ✅ Cambiar a 100 por defecto
        {
            try
            {
                // Validar parámetros
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 200) pageSize = 100; // ✅ Máximo 200

                var spaces = await _spaceService.GetAllSpacesAsync(page, pageSize);
                return Ok(spaces);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los espacios");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ✅ Endpoint público - No requiere autenticación
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSpaceById(int id)
        {
            try
            {
                var space = await _spaceService.GetSpaceByIdAsync(id);
                if (space == null)
                    return NotFound(new { message = $"Espacio con ID {id} no encontrado" });

                return Ok(space);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener espacio por ID: {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ✅ Endpoint público - No requiere autenticación
        [HttpGet("available")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAvailableSpaces(
            [FromQuery] DateTime startTime,
            [FromQuery] DateTime endTime,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                // Validar parámetros
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var spaces = await _spaceService.GetAvailableSpacesAsync(startTime, endTime, page, pageSize);
                return Ok(spaces);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener espacios disponibles");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ✅ Endpoint público - No requiere autenticación
        [HttpGet("city/{city}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSpacesByCity(string city)
        {
            try
            {
                var spaces = await _spaceService.GetSpacesByCityAsync(city);
                return Ok(spaces);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener espacios por ciudad: {City}", city);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ✅ Endpoint público - No requiere autenticación
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchSpaces([FromQuery] string term, [FromQuery] string? city = null, [FromQuery] string? type = null)
        {
            try
            {
                var spaces = await _spaceService.SearchSpacesAsync(term, city, type);
                return Ok(spaces);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al buscar espacios: {Term}", term);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ✅ Endpoint público - No requiere autenticación
        [HttpGet("{id}/availability")]
        [AllowAnonymous]
        public async Task<IActionResult> CheckAvailability(int id, [FromQuery] DateTime startTime, [FromQuery] DateTime endTime)
        {
            try
            {
                var isAvailable = await _spaceService.CheckAvailabilityAsync(id, startTime, endTime);
                return Ok(new { spaceId = id, isAvailable });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar disponibilidad: {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ⚠️ Solo Admin - Requiere autenticación
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateSpace([FromBody] SpaceRequestDto request)
        {
            try
            {
                var space = await _spaceService.CreateSpaceAsync(request);
                return CreatedAtAction(nameof(GetSpaceById), new { id = space.Id }, space);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear espacio: {SpaceName}", request.Name);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ⚠️ Solo Admin - Requiere autenticación
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSpace(int id, [FromBody] SpaceRequestDto request)
        {
            try
            {
                var space = await _spaceService.UpdateSpaceAsync(id, request);
                if (space == null)
                    return NotFound(new { message = $"Espacio con ID {id} no encontrado" });

                return Ok(space);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar espacio: {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ⚠️ Solo Admin - Requiere autenticación
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSpace(int id)
        {
            try
            {
                var result = await _spaceService.DeleteSpaceAsync(id);
                if (!result)
                    return NotFound(new { message = $"Espacio con ID {id} no encontrado" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar espacio: {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}
