using AutoMapper;
using KineticWorkspace.API.Models.DTOs.Spaces;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Interfaces.Spaces;

namespace KineticWorkspace.API.Services.Implementations.Spaces
{
    public class SpaceAvailabilityService : ISpaceAvailabilityService
    {
        private readonly ISpaceRepository _spaceRepository;
        private readonly IMapper _mapper;

        public SpaceAvailabilityService(
            ISpaceRepository spaceRepository,
            IMapper mapper)
        {
            _spaceRepository = spaceRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<SpaceResponseDto>> GetAvailableSpacesAsync(
            DateTime startTime, DateTime endTime, int page = 1, int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100;

            var spaces = await _spaceRepository.GetAvailableSpacesAsync(startTime, endTime);
            var pagedSpaces = spaces.Skip((page - 1) * pageSize).Take(pageSize);

            return _mapper.Map<IEnumerable<SpaceResponseDto>>(pagedSpaces);
        }

        public async Task<bool> CheckAvailabilityAsync(int spaceId, DateTime startTime, DateTime endTime)
        {
            return await _spaceRepository.IsSpaceAvailableAsync(spaceId, startTime, endTime);
        }

        public async Task<SpaceAvailabilityDto?> GetSpaceAvailabilityAsync(
            int spaceId, DateTime startDate, DateTime endDate)
        {
            var space = await _spaceRepository.GetByIdAsync(spaceId);
            if (space == null) return null;

            return new SpaceAvailabilityDto
            {
                SpaceId = space.Id,
                SpaceName = space.Name,
                Date = startDate,
                AvailableSlots = new List<TimeSlotDto>()
            };
        }
    }
}