// backend/KineticWorkspace.API/Controllers/AmenitiesController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KineticWorkspace.API.Models.DTOs.Amenities;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AmenitiesController : ControllerBase
    {
        private readonly IAmenityService _amenityService;
        private readonly ILogger<AmenitiesController> _logger;

        public AmenitiesController(IAmenityService amenityService, ILogger<AmenitiesController> logger)
        {
            _amenityService = amenityService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todas las amenidades (solo admin)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var amenities = await _amenityService.GetAllAmenitiesAsync();
                return Ok(amenities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todas las amenidades");
                // ✅ Devolver error detallado en desarrollo
                return StatusCode(500, new
                {
                    message = "Error interno del servidor",
                    detail = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        /// <summary>
        /// Obtener amenidades activas (público)
        /// </summary>
        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActive()
        {
            try
            {
                var amenities = await _amenityService.GetActiveAmenitiesAsync();
                return Ok(amenities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener amenidades activas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener amenidad por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var amenity = await _amenityService.GetAmenityByIdAsync(id);
                if (amenity == null)
                    return NotFound(new { message = $"Amenidad con ID {id} no encontrada" });

                return Ok(amenity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener amenidad {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear una nueva amenidad
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AmenityRequestDto request)
        {
            try
            {
                var amenity = await _amenityService.CreateAmenityAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = amenity.Id }, amenity);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear amenidad");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar una amenidad
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AmenityRequestDto request)
        {
            try
            {
                var amenity = await _amenityService.UpdateAmenityAsync(id, request);
                if (amenity == null)
                    return NotFound(new { message = $"Amenidad con ID {id} no encontrada" });

                return Ok(amenity);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar amenidad {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar una amenidad
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _amenityService.DeleteAmenityAsync(id);
                if (!result)
                    return NotFound(new { message = $"Amenidad con ID {id} no encontrada" });

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar amenidad {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Activar/Desactivar una amenidad
        /// </summary>
        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            try
            {
                var result = await _amenityService.ToggleAmenityStatusAsync(id);
                if (!result)
                    return NotFound(new { message = $"Amenidad con ID {id} no encontrada" });

                return Ok(new { message = "Estado actualizado exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cambiar estado de amenidad {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Buscar amenidades
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string term)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(term))
                    return await GetAll();

                var amenities = await _amenityService.SearchAmenitiesAsync(term);
                return Ok(amenities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al buscar amenidades con término '{Term}'", term);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}