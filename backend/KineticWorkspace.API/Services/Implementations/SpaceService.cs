using AutoMapper;
using KineticWorkspace.API.Models.DTOs.Spaces;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Services.Implementations
{
    public class SpaceService : ISpaceService
    {
        private readonly ISpaceRepository _spaceRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<SpaceService> _logger;

        public SpaceService(ISpaceRepository spaceRepository, IMapper mapper, ILogger<SpaceService> logger)
        {
            _spaceRepository = spaceRepository;
            _mapper = mapper;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene todos los espacios con paginación
        /// </summary>
        public async Task<IEnumerable<SpaceResponseDto>> GetAllSpacesAsync(int page = 1, int pageSize = 20)
        {
            // Validar parámetros
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100;

            var spaces = await _spaceRepository.GetPagedAsync(page, pageSize);
            return _mapper.Map<IEnumerable<SpaceResponseDto>>(spaces);
        }

        /// <summary>
        /// Obtiene espacios disponibles con paginación
        /// </summary>
        public async Task<IEnumerable<SpaceResponseDto>> GetAvailableSpacesAsync(DateTime startTime, DateTime endTime, int page = 1, int pageSize = 20)
        {
            // Validar parámetros
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100;

            var spaces = await _spaceRepository.GetAvailableSpacesAsync(startTime, endTime);
            var pagedSpaces = spaces.Skip((page - 1) * pageSize).Take(pageSize);
            return _mapper.Map<IEnumerable<SpaceResponseDto>>(pagedSpaces);
        }

        public async Task<SpaceResponseDto?> GetSpaceByIdAsync(int id)
        {
            var space = await _spaceRepository.GetSpaceWithDetailsAsync(id);
            return space != null ? _mapper.Map<SpaceResponseDto>(space) : null;
        }

        public async Task<SpaceResponseDto> CreateSpaceAsync(SpaceRequestDto request)
        {
            var space = _mapper.Map<Space>(request);
            space.CreatedAt = DateTime.UtcNow;

            if (request.ImageUrls != null && request.ImageUrls.Any())
            {
                space.ImageUrls = string.Join(",", request.ImageUrls);
            }

            var createdSpace = await _spaceRepository.AddAsync(space);
            _logger.LogInformation("Nuevo espacio creado: {SpaceName}", space.Name);

            return _mapper.Map<SpaceResponseDto>(createdSpace);
        }

        public async Task<SpaceResponseDto?> UpdateSpaceAsync(int id, SpaceRequestDto request)
        {
            var existingSpace = await _spaceRepository.GetByIdAsync(id);
            if (existingSpace == null) return null;

            _mapper.Map(request, existingSpace);
            existingSpace.UpdatedAt = DateTime.UtcNow;

            if (request.ImageUrls != null && request.ImageUrls.Any())
            {
                existingSpace.ImageUrls = string.Join(",", request.ImageUrls);
            }

            await _spaceRepository.UpdateAsync(existingSpace);
            _logger.LogInformation("Espacio actualizado: {SpaceName}", existingSpace.Name);

            return _mapper.Map<SpaceResponseDto>(existingSpace);
        }

        public async Task<bool> DeleteSpaceAsync(int id)
        {
            var space = await _spaceRepository.GetByIdAsync(id);
            if (space == null) return false;

            space.DeletedAt = DateTime.UtcNow;
            space.IsActive = false;
            await _spaceRepository.UpdateAsync(space);

            _logger.LogInformation("Espacio eliminado: {SpaceName}", space.Name);
            return true;
        }

        public async Task<IEnumerable<SpaceResponseDto>> GetFeaturedSpacesAsync(int limit = 10)
        {
            var spaces = await _spaceRepository.GetFeaturedSpacesAsync(limit);
            return _mapper.Map<IEnumerable<SpaceResponseDto>>(spaces);
        }

        public async Task<IEnumerable<SpaceResponseDto>> GetSpacesByCityAsync(string city)
        {
            var spaces = await _spaceRepository.GetSpacesByCityAsync(city);
            return _mapper.Map<IEnumerable<SpaceResponseDto>>(spaces);
        }

        public async Task<IEnumerable<SpaceResponseDto>> SearchSpacesAsync(string searchTerm, string? city = null, string? type = null)
        {
            var spaces = await _spaceRepository.SearchSpacesAsync(searchTerm, city, type);
            return _mapper.Map<IEnumerable<SpaceResponseDto>>(spaces);
        }

        public async Task<bool> CheckAvailabilityAsync(int spaceId, DateTime startTime, DateTime endTime)
        {
            return await _spaceRepository.IsSpaceAvailableAsync(spaceId, startTime, endTime);
        }

        public async Task<SpaceAvailabilityDto?> GetSpaceAvailabilityAsync(int spaceId, DateTime startDate, DateTime endDate)
        {
            // Implementación simplificada
            var space = await _spaceRepository.GetByIdAsync(spaceId);
            if (space == null) return null;

            return new SpaceAvailabilityDto
            {
                SpaceId = space.Id,
                SpaceName = space.Name,
                Date = startDate,
                AvailableSlots = new List<TimeSlotDto>()
            };
        }

        public async Task<IEnumerable<SpaceResponseDto>> GetAllSpacesUnpaginatedAsync()
        {
            var spaces = await _spaceRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<SpaceResponseDto>>(spaces);
        }
    }
}