using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Services.Interfaces.Spaces
{
    public interface ISpaceAmenityService
    {
        /// <summary>
        /// Resuelve las amenidades por IDs. Devuelve lista vacía si no hay IDs.
        /// </summary>
        Task<List<Amenity>> ResolveAmenitiesAsync(List<int>? amenityIds);
    }
}