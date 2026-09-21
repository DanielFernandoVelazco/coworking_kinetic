using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;

namespace KineticWorkspace.API.Repositories.Implementations
{
    public class RefreshTokenRepository : GenericRepository<RefreshToken>, IRefreshTokenRepository
    {
        public RefreshTokenRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash)
        {
            return await _dbSet
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == tokenHash);
        }

        public async Task<bool> RevokeAsync(int id)
        {
            var token = await GetByIdAsync(id);
            if (token == null) return false;

            token.RevokedAt = DateTime.UtcNow;
            await UpdateAsync(token);
            return true;
        }

        public async Task<bool> RevokeAllByUserIdAsync(int userId)
        {
            var tokens = await _dbSet
                .Where(rt => rt.UserId == userId && rt.RevokedAt == null)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.RevokedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}