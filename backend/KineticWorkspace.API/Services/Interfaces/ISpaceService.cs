// backend/KineticWorkspace.API/Services/Interfaces/ISpaceService.cs
using KineticWorkspace.API.Models.DTOs.Spaces;

namespace KineticWorkspace.API.Services.Interfaces
{
    public interface ISpaceService
    {
        // Metodos con paginacion
        Task<IEnumerable<SpaceResponseDto>> GetAllSpacesAsync(int page = 1, int pageSize = 20);
        Task<IEnumerable<SpaceResponseDto>> GetAvailableSpacesAsync(DateTime startTime, DateTime endTime, int page = 1, int pageSize = 20);

        // Metodo sin paginacion (para el frontend)
        Task<IEnumerable<SpaceResponseDto>> GetAllSpacesUnpaginatedAsync();

        // Metodos sin paginacion
        Task<SpaceResponseDto?> GetSpaceByIdAsync(int id);
        Task<SpaceResponseDto> CreateSpaceAsync(SpaceRequestDto request);
        Task<SpaceResponseDto?> UpdateSpaceAsync(int id, SpaceRequestDto request);
        Task<bool> DeleteSpaceAsync(int id);
        Task<IEnumerable<SpaceResponseDto>> GetFeaturedSpacesAsync(int limit = 10);
        Task<IEnumerable<SpaceResponseDto>> GetSpacesByCityAsync(string city);
        Task<IEnumerable<SpaceResponseDto>> SearchSpacesAsync(string searchTerm, string? city = null, string? type = null);
        Task<bool> CheckAvailabilityAsync(int spaceId, DateTime startTime, DateTime endTime);
        Task<SpaceAvailabilityDto?> GetSpaceAvailabilityAsync(int spaceId, DateTime startDate, DateTime endDate);
    }


}