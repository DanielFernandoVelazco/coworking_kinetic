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

        public async Task<IEnumerable<SpaceResponseDto>> GetAllSpacesAsync()
        {
            var spaces = await _spaceRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<SpaceResponseDto>>(spaces);
        }

        public async Task<IEnumerable<SpaceResponseDto>> GetAvailableSpacesAsync(DateTime startTime, DateTime endTime)
        {
            var spaces = await _spaceRepository.GetAvailableSpacesAsync(startTime, endTime);
            return _mapper.Map<IEnumerable<SpaceResponseDto>>(spaces);
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
    }
}