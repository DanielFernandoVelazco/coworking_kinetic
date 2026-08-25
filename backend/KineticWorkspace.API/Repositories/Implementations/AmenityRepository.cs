// backend/KineticWorkspace.API/Repositories/Implementations/AmenityRepository.cs
using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;

namespace KineticWorkspace.API.Repositories.Implementations
{
    public class AmenityRepository : GenericRepository<Amenity>, IAmenityRepository
    {
        public AmenityRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Amenity>> GetActiveAmenitiesAsync()
        {
            return await _dbSet
                .Where(a => a.IsActive)
                .OrderBy(a => a.Name)
                .ToListAsync();
        }

        public async Task<Amenity?> GetAmenityWithSpacesAsync(int id)
        {
            return await _dbSet
                .Include(a => a.Spaces)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<bool> IsAmenityInUseAsync(int id)
        {
            return await _dbSet
                .Where(a => a.Id == id)
                .SelectMany(a => a.Spaces)
                .AnyAsync();
        }

        public async Task<IEnumerable<Amenity>> SearchAmenitiesAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await _dbSet.OrderBy(a => a.Name).ToListAsync();

            var searchLower = searchTerm.ToLower();
            return await _dbSet
                .Where(a => a.Name.ToLower().Contains(searchLower) ||
                           (a.Description != null && a.Description.ToLower().Contains(searchLower)))
                .OrderBy(a => a.Name)
                .ToListAsync();
        }

        public async Task<int> GetSpacesCountAsync(int amenityId)
        {
            return await _dbSet
                .Where(a => a.Id == amenityId)
                .SelectMany(a => a.Spaces)
                .CountAsync();
        }
    }
}