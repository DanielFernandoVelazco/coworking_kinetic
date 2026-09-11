using AutoMapper;
using KineticWorkspace.API.Models.DTOs.Spaces;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Interfaces;
using KineticWorkspace.API.Services.Interfaces.Spaces;

namespace KineticWorkspace.API.Services.Implementations
{
    public class SpaceService : ISpaceService
    {
        private readonly ISpaceRepository _spaceRepository;
        private readonly ISpaceAvailabilityService _availabilityService;
        private readonly ISpaceAmenityService _amenityService;
        private readonly IMapper _mapper;
        private readonly ILogger<SpaceService> _logger;

        public SpaceService(
            ISpaceRepository spaceRepository,
            ISpaceAvailabilityService availabilityService,
            ISpaceAmenityService amenityService,
            IMapper mapper,
            ILogger<SpaceService> logger)
        {
            _spaceRepository = spaceRepository;
            _availabilityService = availabilityService;
            _amenityService = amenityService;
            _mapper = mapper;
            _logger = logger;
        }

        // ==================== LECTURA PAGINADA ====================

        public async Task<IEnumerable<SpaceResponseDto>> GetAllSpacesAsync(int page = 1, int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100;

            var (items, _) = await _spaceRepository.GetPagedWithAmenitiesAsync(page, pageSize);
            return _mapper.Map<IEnumerable<SpaceResponseDto>>(items);
        }

        public async Task<IEnumerable<SpaceResponseDto>> GetAllSpacesUnpaginatedAsync()
        {
            var spaces = await _spaceRepository.GetAllWithAmenitiesAsync();
            return _mapper.Map<IEnumerable<SpaceResponseDto>>(spaces);
        }

        public async Task<SpaceResponseDto?> GetSpaceByIdAsync(int id)
        {
            var space = await _spaceRepository.GetSpaceWithDetailsAsync(id);
            return space != null ? _mapper.Map<SpaceResponseDto>(space) : null;
        }

        // ==================== CRUD ====================

        public async Task<SpaceResponseDto> CreateSpaceAsync(SpaceRequestDto request)
        {
            var space = _mapper.Map<Space>(request);
            space.CreatedAt = DateTime.UtcNow;

            if (request.ImageUrls != null && request.ImageUrls.Any())
            {
                space.ImageUrls = string.Join(",", request.ImageUrls);
            }

            space.Amenities = await _amenityService.ResolveAmenitiesAsync(request.AmenityIds);

            var createdSpace = await _spaceRepository.AddAsync(space);
            _logger.LogInformation(
                "Nuevo espacio creado: {SpaceName} con {AmenityCount} amenidades",
                space.Name, space.Amenities?.Count ?? 0);

            return _mapper.Map<SpaceResponseDto>(createdSpace);
        }

        public async Task<SpaceResponseDto?> UpdateSpaceAsync(int id, SpaceRequestDto request)
        {
            var existingSpace = await _spaceRepository.GetSpaceWithDetailsAsync(id);
            if (existingSpace == null) return null;

            _mapper.Map(request, existingSpace);
            existingSpace.UpdatedAt = DateTime.UtcNow;

            if (request.ImageUrls != null && request.ImageUrls.Any())
            {
                existingSpace.ImageUrls = string.Join(",", request.ImageUrls);
            }

            if (request.AmenityIds != null)
            {
                existingSpace.Amenities = await _amenityService.ResolveAmenitiesAsync(request.AmenityIds);
            }
            else
            {
                existingSpace.Amenities = new List<Amenity>();
            }

            await _spaceRepository.UpdateAsync(existingSpace);
            _logger.LogInformation(
                "Espacio actualizado: {SpaceName} con {AmenityCount} amenidades",
                existingSpace.Name, existingSpace.Amenities?.Count ?? 0);

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

        // ==================== LISTADOS POR FILTRO ====================

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

        public async Task<IEnumerable<SpaceResponseDto>> SearchSpacesAsync(
            string searchTerm, string? city = null, string? type = null)
        {
            var spaces = await _spaceRepository.SearchSpacesAsync(searchTerm, city, type);
            return _mapper.Map<IEnumerable<SpaceResponseDto>>(spaces);
        }

        // ==================== DELEGACIÓN A DISPONIBILIDAD ====================

        public Task<IEnumerable<SpaceResponseDto>> GetAvailableSpacesAsync(
            DateTime startTime, DateTime endTime, int page = 1, int pageSize = 20)
            => _availabilityService.GetAvailableSpacesAsync(startTime, endTime, page, pageSize);

        public Task<bool> CheckAvailabilityAsync(int spaceId, DateTime startTime, DateTime endTime)
            => _availabilityService.CheckAvailabilityAsync(spaceId, startTime, endTime);

        public Task<SpaceAvailabilityDto?> GetSpaceAvailabilityAsync(
            int spaceId, DateTime startDate, DateTime endDate)
            => _availabilityService.GetSpaceAvailabilityAsync(spaceId, startDate, endDate);
    }
}