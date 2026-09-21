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

        public async Task<IEnumerable<Space>> GetAllWithAmenitiesAsync()
        {
            return await _dbSet
                .Include(s => s.Amenities)
                .Include(s => s.Reviews)
                .Where(s => s.DeletedAt == null)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<(IEnumerable<Space> Items, int TotalCount)> GetPagedWithAmenitiesAsync(int page, int pageSize)
        {
            var query = _dbSet
                .Include(s => s.Amenities)
                .Include(s => s.Reviews)
                .Where(s => s.DeletedAt == null);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(s => s.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        // ========== RESTO DE MÉTODOS EXISTENTES ==========

        public async Task<IEnumerable<Space>> GetAvailableSpacesAsync(DateTime startTime, DateTime endTime)
        {
            // Nota: NO usamos Include aquí porque solo proyectamos/ordenamos por rating.
            // Los includes se agregan después en el servicio si hacen falta.
            var spaces = await _dbSet
                .Include(s => s.Amenities)
                .Where(s => s.IsActive && s.IsAvailable && s.DeletedAt == null)
                .Where(s => !s.Reservations.Any(r =>
                    r.Status != "Cancelled" &&
                    r.StartTime < endTime &&
                    r.EndTime > startTime))
                .OrderByDescending(s => s.Reviews.Any() ? s.Reviews.Average(r => (double?)r.Rating) : 0)
                .ToListAsync();

            return spaces;
        }

        public async Task<IEnumerable<Space>> GetSpacesByTypeAsync(string type)
        {
            return await _dbSet
                .Include(s => s.Reviews)
                .Include(s => s.Amenities)
                .Where(s => s.Type == type && s.IsActive && s.DeletedAt == null)
                .OrderByDescending(s => s.Reviews.Any() ? s.Reviews.Average(r => (double?)r.Rating) : 0)
                .ToListAsync();
        }

        public async Task<IEnumerable<Space>> GetFeaturedSpacesAsync(int limit = 10)
        {
            return await _dbSet
                .Include(s => s.Reviews)
                .Include(s => s.Amenities)
                .Where(s => s.IsFeatured && s.IsActive && s.IsAvailable && s.DeletedAt == null)
                .OrderByDescending(s => s.Reviews.Any() ? s.Reviews.Average(r => (double?)r.Rating) : 0)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<Space>> GetSpacesByCityAsync(string city)
        {
            return await _dbSet
                .Include(s => s.Reviews)
                .Include(s => s.Amenities)
                .Where(s => s.City == city && s.IsActive && s.DeletedAt == null)
                .OrderByDescending(s => s.Reviews.Any() ? s.Reviews.Average(r => (double?)r.Rating) : 0)
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

        public async Task<bool> IsSpaceAvailableAsync(
    int spaceId,
    DateTime startTime,
    DateTime endTime,
    int? excludeReservationId = null)
        {
            var space = await _dbSet
                .FirstOrDefaultAsync(s => s.Id == spaceId && s.IsActive && s.DeletedAt == null);

            if (space == null || !space.IsAvailable)
                return false;

            var query = _context.Reservations
                .Where(r => r.SpaceId == spaceId
                         && r.Status != "Cancelled"
                         && r.StartTime < endTime
                         && r.EndTime > startTime);

            if (excludeReservationId.HasValue)
                query = query.Where(r => r.Id != excludeReservationId.Value);

            return !await query.AnyAsync();
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
    .OrderByDescending(s => s.Reviews.Any() ? s.Reviews.Average(r => (double?)r.Rating) : 0)
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
                .OrderByDescending(s => s.Reviews.Any() ? s.Reviews.Average(r => (double?)r.Rating) : 0)
                .Take(limit)
                .ToListAsync();
        }
    }
}