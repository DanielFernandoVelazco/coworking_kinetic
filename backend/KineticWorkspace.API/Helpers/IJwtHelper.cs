using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Helpers
{
    public interface IJwtHelper
    {
        string GenerateJwtToken(User user);
        string GenerateRefreshToken();
    }
}