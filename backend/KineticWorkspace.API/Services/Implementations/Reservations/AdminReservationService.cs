using AutoMapper;
using KineticWorkspace.API.Models.DTOs.Reservations;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Interfaces.Reservations;

namespace KineticWorkspace.API.Services.Implementations.Reservations
{
    public class AdminReservationService : IAdminReservationService
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<AdminReservationService> _logger;

        public AdminReservationService(
            IReservationRepository reservationRepository,
            IMapper mapper,
            ILogger<AdminReservationService> logger)
        {
            _reservationRepository = reservationRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<ReservationResponseDto>> GetActiveReservationsAsync()
        {
            var reservations = await _reservationRepository.GetActiveReservationsAsync();
            return _mapper.Map<IEnumerable<ReservationResponseDto>>(reservations);
        }

        public async Task<bool> ConfirmReservationAsync(int id, int adminUserId)
        {
            var reservation = await _reservationRepository.GetByIdAsync(id);
            if (reservation == null) return false;

            if (reservation.Status != "Pending")
                throw new InvalidOperationException("Solo se pueden confirmar reservaciones pendientes");

            reservation.Status = "Confirmed";
            reservation.UpdatedAt = DateTime.UtcNow;
            await _reservationRepository.UpdateAsync(reservation);

            _logger.LogInformation(
                "Reservación confirmada: {ReservationId} por Admin: {AdminId}",
                id, adminUserId);

            return true;
        }

        public async Task<PaginatedReservationResponseDto> GetAllReservationsFilteredAsync(
            int page, int pageSize, string? sortBy, string? status,
            string? searchTerm, int? userId, int? spaceId)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 15;
            if (pageSize > 100) pageSize = 100;

            var (items, totalCount) = await _reservationRepository.GetAllReservationsFilteredAsync(
                page, pageSize, sortBy, status, searchTerm, userId, spaceId);

            var mappedItems = _mapper.Map<IEnumerable<ReservationResponseDto>>(items);

            return new PaginatedReservationResponseDto
            {
                Items = mappedItems.ToList(),
                CurrentPage = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                TotalCount = totalCount,
                SortBy = sortBy ?? "date_desc",
                Status = status ?? "all"
            };
        }
    }
}