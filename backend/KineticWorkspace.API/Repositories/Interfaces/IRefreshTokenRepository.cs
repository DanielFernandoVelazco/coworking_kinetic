using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Repositories.Interfaces
{
    public interface IRefreshTokenRepository : IGenericRepository<RefreshToken>
    {
        Task<RefreshToken?> GetByTokenHashAsync(string tokenHash);
        Task<bool> RevokeAsync(int id);
        Task<bool> RevokeAllByUserIdAsync(int userId);
    }
}