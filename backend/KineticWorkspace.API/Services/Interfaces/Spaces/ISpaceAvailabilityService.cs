using KineticWorkspace.API.Models.DTOs.Spaces;

namespace KineticWorkspace.API.Services.Interfaces.Spaces
{
    public interface ISpaceAvailabilityService
    {
        Task<IEnumerable<SpaceResponseDto>> GetAvailableSpacesAsync(
            DateTime startTime, DateTime endTime, int page = 1, int pageSize = 20);

        Task<bool> CheckAvailabilityAsync(int spaceId, DateTime startTime, DateTime endTime);

        Task<SpaceAvailabilityDto?> GetSpaceAvailabilityAsync(
            int spaceId, DateTime startDate, DateTime endDate);
    }
}