// backend/KineticWorkspace.API/Repositories/Implementations/SpaceRepository.cs
using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;

namespace KineticWorkspace.API.Repositories.Implementations
{
    public class SpaceRepository : GenericRepository<Space>, ISpaceRepository
    {
        public SpaceRepository(ApplicationDbContext context) : base(context)
        {
        }

        // Sobrescribir GetAllAsync para incluir Amenities y Reviews
        public override async Task<IEnumerable<Space>> GetAllAsync()
        {
            return await _dbSet
                .Include(s => s.Amenities)
                .Include(s => s.Reviews)
                .Where(s => s.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<IEnumerable<Space>> GetAvailableSpacesAsync(DateTime startTime, DateTime endTime)
        {
            var spaces = await _dbSet
                .Include(s => s.Reviews)
                .Include(s => s.Amenities)
                .Where(s => s.IsActive && s.IsAvailable && s.DeletedAt == null)
                .Where(s => !s.Reservations.Any(r =>
                    r.Status != "Cancelled" &&
                    r.Status != "Completed" &&
                    ((startTime >= r.StartTime && startTime < r.EndTime) ||
                     (endTime > r.StartTime && endTime <= r.EndTime) ||
                     (startTime <= r.StartTime && endTime >= r.EndTime))))
                .OrderByDescending(s => s.Reviews.Average(r => r.Rating))
                .ToListAsync();

            return spaces;
        }

        public async Task<IEnumerable<Space>> GetSpacesByTypeAsync(string type)
        {
            return await _dbSet
                .Include(s => s.Reviews)
                .Include(s => s.Amenities)
                .Where(s => s.Type == type && s.IsActive && s.DeletedAt == null)
                .OrderByDescending(s => s.Reviews.Average(r => r.Rating))
                .ToListAsync();
        }

        public async Task<IEnumerable<Space>> GetFeaturedSpacesAsync(int limit = 10)
        {
            return await _dbSet
                .Include(s => s.Reviews)
                .Include(s => s.Amenities)
                .Where(s => s.IsFeatured && s.IsActive && s.IsAvailable && s.DeletedAt == null)
                .OrderByDescending(s => s.Reviews.Average(r => r.Rating))
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<Space>> GetSpacesByCityAsync(string city)
        {
            return await _dbSet
                .Include(s => s.Reviews)
                .Include(s => s.Amenities)
                .Where(s => s.City == city && s.IsActive && s.DeletedAt == null)
                .OrderByDescending(s => s.Reviews.Average(r => r.Rating))
                .ToListAsync();
        }

        public async Task<Space?> GetSpaceWithDetailsAsync(int spaceId)
        {
            return await _dbSet
                .Include(s => s.Reservations)
                .Include(s => s.Reviews)
                .Include(s => s.Amenities)
                .FirstOrDefaultAsync(s => s.Id == spaceId && s.DeletedAt == null);
        }

        public async Task<bool> IsSpaceAvailableAsync(int spaceId, DateTime startTime, DateTime endTime, int? excludeReservationId = null)
        {
            var space = await _dbSet
                .Include(s => s.Reservations)
                .FirstOrDefaultAsync(s => s.Id == spaceId && s.IsActive && s.DeletedAt == null);

            if (space == null || !space.IsAvailable)
                return false;

            var query = space.Reservations.Where(r =>
                r.Status != "Cancelled" &&
                r.Status != "Completed" &&
                ((startTime >= r.StartTime && startTime < r.EndTime) ||
                 (endTime > r.StartTime && endTime <= r.EndTime) ||
                 (startTime <= r.StartTime && endTime >= r.EndTime)));

            if (excludeReservationId.HasValue)
            {
                query = query.Where(r => r.Id != excludeReservationId.Value);
            }

            return !query.Any();
        }

        public async Task<IEnumerable<Space>> SearchSpacesAsync(string searchTerm, string? city = null, string? type = null)
        {
            var query = _dbSet
                .Include(s => s.Reviews)
                .Include(s => s.Amenities)
                .Where(s => s.IsActive && s.DeletedAt == null);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(s =>
                    s.Name.Contains(searchTerm) ||
                    s.Description.Contains(searchTerm) ||
                    s.Address.Contains(searchTerm) ||
                    s.City.Contains(searchTerm));
            }

            if (!string.IsNullOrWhiteSpace(city))
            {
                query = query.Where(s => s.City == city);
            }

            if (!string.IsNullOrWhiteSpace(type))
            {
                query = query.Where(s => s.Type == type);
            }

            return await query
                .OrderByDescending(s => s.Reviews.Average(r => r.Rating))
                .ToListAsync();
        }

        public async Task<bool> UpdateAvailabilityAsync(int spaceId, bool isAvailable)
        {
            var space = await GetByIdAsync(spaceId);
            if (space == null) return false;

            space.IsAvailable = isAvailable;
            await UpdateAsync(space);
            return true;
        }

        public async Task<IEnumerable<Space>> GetSpacesWithHighRatingAsync(int minRating = 4, int limit = 10)
        {
            return await _dbSet
                .Include(s => s.Reviews)
                .Include(s => s.Amenities)
                .Where(s => s.IsActive && s.DeletedAt == null)
                .Where(s => s.Reviews.Any())
                .OrderByDescending(s => s.Reviews.Average(r => r.Rating))
                .Take(limit)
                .ToListAsync();
        }
    }
}