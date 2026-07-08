using KineticWorkspace.API.Models.DTOs.Spaces;

namespace KineticWorkspace.API.Services.Interfaces
{
    public interface ISpaceService
    {
        Task<IEnumerable<SpaceResponseDto>> GetAllSpacesAsync();
        Task<IEnumerable<SpaceResponseDto>> GetAvailableSpacesAsync(DateTime startTime, DateTime endTime);
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