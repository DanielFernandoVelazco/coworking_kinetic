// backend/KineticWorkspace.API/Repositories/Interfaces/IAmenityRepository.cs
using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Repositories.Interfaces
{
    public interface IAmenityRepository : IGenericRepository<Amenity>
    {
        Task<IEnumerable<Amenity>> GetActiveAmenitiesAsync();
        Task<Amenity?> GetAmenityWithSpacesAsync(int id);
        Task<bool> IsAmenityInUseAsync(int id);
        Task<IEnumerable<Amenity>> SearchAmenitiesAsync(string searchTerm);
        Task<int> GetSpacesCountAsync(int amenityId);
    }
}