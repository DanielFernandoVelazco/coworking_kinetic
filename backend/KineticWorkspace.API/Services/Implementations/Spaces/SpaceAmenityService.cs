using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Services.Interfaces.Spaces;

namespace KineticWorkspace.API.Services.Implementations.Spaces
{
    public class SpaceAmenityService : ISpaceAmenityService
    {
        private readonly ApplicationDbContext _context;

        public SpaceAmenityService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Amenity>> ResolveAmenitiesAsync(List<int>? amenityIds)
        {
            if (amenityIds == null || !amenityIds.Any())
                return new List<Amenity>();

            return await _context.Amenities
                .Where(a => amenityIds.Contains(a.Id))
                .ToListAsync();
        }
    }
}