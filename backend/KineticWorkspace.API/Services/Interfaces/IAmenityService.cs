// backend/KineticWorkspace.API/Services/Interfaces/IAmenityService.cs
using KineticWorkspace.API.Models.DTOs.Amenities;

namespace KineticWorkspace.API.Services.Interfaces
{
    public interface IAmenityService
    {
        Task<IEnumerable<AmenityResponseDto>> GetAllAmenitiesAsync();
        Task<IEnumerable<AmenityResponseDto>> GetActiveAmenitiesAsync();
        Task<AmenityResponseDto?> GetAmenityByIdAsync(int id);
        Task<AmenityResponseDto> CreateAmenityAsync(AmenityRequestDto request);
        Task<AmenityResponseDto?> UpdateAmenityAsync(int id, AmenityRequestDto request);
        Task<bool> DeleteAmenityAsync(int id);
        Task<bool> ToggleAmenityStatusAsync(int id);
        Task<IEnumerable<AmenityResponseDto>> SearchAmenitiesAsync(string searchTerm);
        Task<bool> IsAmenityInUseAsync(int id);
    }
}