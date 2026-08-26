// backend/KineticWorkspace.API/Services/Implementations/AmenityService.cs
using AutoMapper;
using KineticWorkspace.API.Models.DTOs.Amenities;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Services.Implementations
{
    public class AmenityService : IAmenityService
    {
        private readonly IAmenityRepository _amenityRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<AmenityService> _logger;

        public AmenityService(
            IAmenityRepository amenityRepository,
            IMapper mapper,
            ILogger<AmenityService> logger)
        {
            _amenityRepository = amenityRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<AmenityResponseDto>> GetAllAmenitiesAsync()
        {
            var amenities = await _amenityRepository.GetAllAsync();
            var result = new List<AmenityResponseDto>();

            foreach (var amenity in amenities)
            {
                var dto = _mapper.Map<AmenityResponseDto>(amenity);
                dto.SpacesCount = await _amenityRepository.GetSpacesCountAsync(amenity.Id);
                result.Add(dto);
            }

            return result;
        }

        public async Task<IEnumerable<AmenityResponseDto>> GetActiveAmenitiesAsync()
        {
            var amenities = await _amenityRepository.GetActiveAmenitiesAsync();
            return _mapper.Map<IEnumerable<AmenityResponseDto>>(amenities);
        }

        public async Task<AmenityResponseDto?> GetAmenityByIdAsync(int id)
        {
            var amenity = await _amenityRepository.GetAmenityWithSpacesAsync(id);
            if (amenity == null) return null;

            var dto = _mapper.Map<AmenityResponseDto>(amenity);
            dto.SpacesCount = amenity.Spaces?.Count ?? 0;
            return dto;
        }

        public async Task<AmenityResponseDto> CreateAmenityAsync(AmenityRequestDto request)
        {
            // Verificar si ya existe una amenidad con el mismo nombre
            var existing = await _amenityRepository.FindAsync(a => a.Name.ToLower() == request.Name.ToLower());
            if (existing.Any())
            {
                throw new InvalidOperationException($"Ya existe una amenidad con el nombre '{request.Name}'");
            }

            var amenity = _mapper.Map<Amenity>(request);
            amenity.CreatedAt = DateTime.UtcNow;

            var created = await _amenityRepository.AddAsync(amenity);
            _logger.LogInformation("Amenidad creada: {AmenityName}", amenity.Name);

            var dto = _mapper.Map<AmenityResponseDto>(created);
            dto.SpacesCount = 0;
            return dto;
        }

        public async Task<AmenityResponseDto?> UpdateAmenityAsync(int id, AmenityRequestDto request)
        {
            var amenity = await _amenityRepository.GetByIdAsync(id);
            if (amenity == null) return null;

            // ACTUALIZAR SIN VALIDAR DUPLICADOS POR NOMBRE
            amenity.Name = request.Name;
            amenity.Description = request.Description;
            amenity.Icon = request.Icon;
            amenity.IsActive = request.IsActive;
            amenity.UpdatedAt = DateTime.UtcNow;

            await _amenityRepository.UpdateAsync(amenity);
            _logger.LogInformation("Amenidad actualizada: {AmenityName}", amenity.Name);

            var dto = _mapper.Map<AmenityResponseDto>(amenity);
            dto.SpacesCount = await _amenityRepository.GetSpacesCountAsync(id);
            return dto;
        }

        public async Task<bool> DeleteAmenityAsync(int id)
        {
            var amenity = await _amenityRepository.GetAmenityWithSpacesAsync(id);
            if (amenity == null) return false;

            // Verificar si está siendo usada por algún espacio
            if (amenity.Spaces != null && amenity.Spaces.Any())
            {
                throw new InvalidOperationException($"No se puede eliminar la amenidad porque está siendo usada por {amenity.Spaces.Count} espacios");
            }

            await _amenityRepository.DeleteAsync(amenity);
            _logger.LogInformation("Amenidad eliminada: {AmenityName}", amenity.Name);
            return true;
        }

        public async Task<bool> ToggleAmenityStatusAsync(int id)
        {
            var amenity = await _amenityRepository.GetByIdAsync(id);
            if (amenity == null) return false;

            amenity.IsActive = !amenity.IsActive;
            amenity.UpdatedAt = DateTime.UtcNow;

            await _amenityRepository.UpdateAsync(amenity);
            _logger.LogInformation("Estado de amenidad cambiado: {AmenityName} -> {IsActive}",
                amenity.Name, amenity.IsActive);
            return true;
        }

        public async Task<IEnumerable<AmenityResponseDto>> SearchAmenitiesAsync(string searchTerm)
        {
            var amenities = await _amenityRepository.SearchAmenitiesAsync(searchTerm);
            var result = new List<AmenityResponseDto>();

            foreach (var amenity in amenities)
            {
                var dto = _mapper.Map<AmenityResponseDto>(amenity);
                dto.SpacesCount = await _amenityRepository.GetSpacesCountAsync(amenity.Id);
                result.Add(dto);
            }

            return result;
        }

        public async Task<bool> IsAmenityInUseAsync(int id)
        {
            return await _amenityRepository.IsAmenityInUseAsync(id);
        }
    }
}