using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Repositories.Interfaces
{
    public interface ISpaceRepository : IGenericRepository<Space>
    {
        Task<IEnumerable<Space>> GetAvailableSpacesAsync(DateTime startTime, DateTime endTime);
        Task<IEnumerable<Space>> GetSpacesByTypeAsync(string type);
        Task<IEnumerable<Space>> GetFeaturedSpacesAsync(int limit = 10);
        Task<IEnumerable<Space>> GetSpacesByCityAsync(string city);
        Task<Space?> GetSpaceWithDetailsAsync(int spaceId);
        Task<bool> IsSpaceAvailableAsync(int spaceId, DateTime startTime, DateTime endTime, int? excludeReservationId = null);
        Task<IEnumerable<Space>> SearchSpacesAsync(string searchTerm, string? city = null, string? type = null);
        Task<bool> UpdateAvailabilityAsync(int spaceId, bool isAvailable);
        Task<IEnumerable<Space>> GetSpacesWithHighRatingAsync(int minRating = 4, int limit = 10);
        Task<IEnumerable<Space>> GetAllUnpaginatedWithAmenitiesAsync();

    }
}