using AutoMapper;
using KineticWorkspace.API.Helpers.Pricing;
using KineticWorkspace.API.Helpers.Validation;
using KineticWorkspace.API.Models.DTOs.Reservations;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Interfaces.Reservations;

namespace KineticWorkspace.API.Services.Implementations.Reservations
{
    public class UserReservationService : IUserReservationService
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly ISpaceRepository _spaceRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<UserReservationService> _logger;
        private readonly IReservationDateValidator _dateValidator;
        private readonly IPricingCalculator _pricingCalculator;

        public UserReservationService(
            IReservationRepository reservationRepository,
            ISpaceRepository spaceRepository,
            IMapper mapper,
            ILogger<UserReservationService> logger,
            IReservationDateValidator dateValidator,
            IPricingCalculator pricingCalculator)
        {
            _reservationRepository = reservationRepository;
            _spaceRepository = spaceRepository;
            _mapper = mapper;
            _logger = logger;
            _dateValidator = dateValidator;
            _pricingCalculator = pricingCalculator;
        }

        public async Task<IEnumerable<ReservationResponseDto>> GetUserReservationsAsync(int userId)
        {
            var reservations = await _reservationRepository.GetUserReservationsAsync(userId);
            return _mapper.Map<IEnumerable<ReservationResponseDto>>(reservations);
        }

        public async Task<IEnumerable<ReservationResponseDto>> GetUpcomingReservationsAsync(int userId, int limit = 10)
        {
            var reservations = await _reservationRepository.GetUpcomingReservationsAsync(userId, limit);
            return _mapper.Map<IEnumerable<ReservationResponseDto>>(reservations);
        }

        public async Task<ReservationSummaryDto> GetReservationSummaryAsync(int userId)
        {
            var reservations = await _reservationRepository.GetUserReservationsAsync(userId);
            var reservationList = reservations?.ToList() ?? new List<Reservation>();

            var summary = new ReservationSummaryDto
            {
                TotalReservations = reservationList.Count,
                ActiveReservations = reservationList.Count(r =>
                    r.Status == "Confirmed" &&
                    r.StartTime <= DateTime.UtcNow &&
                    r.EndTime >= DateTime.UtcNow),
                UpcomingReservations = reservationList.Count(r =>
                    r.Status == "Confirmed" && r.StartTime > DateTime.UtcNow),
                CompletedReservations = reservationList.Count(r => r.Status == "Completed"),
                CancelledReservations = reservationList.Count(r => r.Status == "Cancelled"),
                TotalSpent = reservationList.Where(r => r.Status == "Completed").Sum(r => r.TotalPrice),
                TotalHoursBooked = (int)reservationList
                    .Where(r => r.Status == "Completed")
                    .Sum(r => (r.EndTime - r.StartTime).TotalHours)
            };

            if (summary.TotalReservations > 0)
            {
                summary.AverageSpentPerReservation = summary.TotalSpent / summary.TotalReservations;
            }

            return summary;
        }

        public async Task<ReservationResponseDto?> GetReservationByIdAsync(int id)
        {
            var reservation = await _reservationRepository.GetReservationWithDetailsAsync(id);
            return reservation != null ? _mapper.Map<ReservationResponseDto>(reservation) : null;
        }

        public async Task<IEnumerable<ReservationResponseDto>> GetSpaceReservationsAsync(int spaceId)
        {
            var reservations = await _reservationRepository.GetSpaceReservationsAsync(spaceId);
            return _mapper.Map<IEnumerable<ReservationResponseDto>>(reservations);
        }

        public async Task<ReservationResponseDto> CreateReservationAsync(ReservationRequestDto request, int userId)
        {
            _dateValidator.Validate(request.StartTime, request.EndTime);

            var isAvailable = await _spaceRepository.IsSpaceAvailableAsync(
                request.SpaceId, request.StartTime, request.EndTime);
            if (!isAvailable)
                throw new InvalidOperationException("El espacio no está disponible en el horario seleccionado");

            var space = await _spaceRepository.GetByIdAsync(request.SpaceId);
            if (space == null)
                throw new InvalidOperationException("Espacio no encontrado");

            var numberOfGuests = request.NumberOfGuests ?? space.Capacity;
            if (numberOfGuests > space.Capacity)
                throw new InvalidOperationException(
                    $"La capacidad máxima del espacio es de {space.Capacity} personas. Has seleccionado {numberOfGuests}.");

            var totalPrice = _pricingCalculator.Calculate(space, request.StartTime, request.EndTime);

            var reservation = new Reservation
            {
                UserId = userId,
                SpaceId = request.SpaceId,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Status = "Pending",
                Notes = request.Notes,
                NumberOfGuests = numberOfGuests,
                TotalPrice = totalPrice,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createdReservation = await _reservationRepository.AddAsync(reservation);
            _logger.LogInformation("Nueva reservación creada: {ReservationId}", createdReservation.Id);

            return _mapper.Map<ReservationResponseDto>(createdReservation);
        }

        public async Task<ReservationResponseDto?> UpdateReservationAsync(
            int id, ReservationRequestDto request, int userId, bool isAdmin = false)
        {
            _dateValidator.Validate(request.StartTime, request.EndTime);

            var reservation = await _reservationRepository.GetReservationWithDetailsAsync(id);
            if (reservation == null) return null;

            if (reservation.UserId != userId && !isAdmin)
                throw new UnauthorizedAccessException("No tienes permiso para modificar esta reservación");

            if (!isAdmin && (reservation.Status == "Cancelled" || reservation.Status == "Completed"))
                throw new InvalidOperationException("No se puede modificar una reservación cancelada o completada");

            var isAvailable = await _spaceRepository.IsSpaceAvailableAsync(
                request.SpaceId, request.StartTime, request.EndTime, id);
            if (!isAvailable)
                throw new InvalidOperationException("El espacio no está disponible en el nuevo horario");

            var space = await _spaceRepository.GetByIdAsync(request.SpaceId);
            if (space == null)
                throw new InvalidOperationException("Espacio no encontrado");

            var numberOfGuests = request.NumberOfGuests ?? space.Capacity;
            if (numberOfGuests > space.Capacity)
                throw new InvalidOperationException(
                    $"La capacidad máxima del espacio es de {space.Capacity} personas. Has seleccionado {numberOfGuests}.");

            var totalPrice = _pricingCalculator.Calculate(space, request.StartTime, request.EndTime);

            var previousUserId = reservation.UserId;
            var previousSpaceId = reservation.SpaceId;

            reservation.SpaceId = request.SpaceId;
            reservation.StartTime = request.StartTime;
            reservation.EndTime = request.EndTime;
            reservation.Notes = request.Notes;
            reservation.NumberOfGuests = numberOfGuests;
            reservation.TotalPrice = totalPrice;
            reservation.UpdatedAt = DateTime.UtcNow;

            if (isAdmin && request.UserId.HasValue && request.UserId.Value > 0)
            {
                reservation.UserId = request.UserId.Value;
            }

            await _reservationRepository.UpdateAsync(reservation);

            _logger.LogInformation(
                "Reservación {ReservationId} actualizada por Admin {AdminId}. " +
                "Usuario: {PreviousUserId} → {NewUserId}, " +
                "Espacio: {PreviousSpaceId} → {NewSpaceId}",
                id, userId, previousUserId, reservation.UserId,
                previousSpaceId, reservation.SpaceId);

            return _mapper.Map<ReservationResponseDto>(reservation);
        }

        public async Task<bool> CancelReservationAsync(int id, int userId, string reason, bool isAdmin = false)
        {
            var reservation = await _reservationRepository.GetReservationWithDetailsAsync(id);
            if (reservation == null) return false;

            if (reservation.UserId != userId && !isAdmin)
                throw new UnauthorizedAccessException("No tienes permiso para cancelar esta reservación");

            if (!isAdmin && reservation.Status == "Completed")
                throw new InvalidOperationException("No se puede cancelar una reservación completada");

            if (isAdmin && reservation.UserId != userId)
            {
                _logger.LogInformation(
                    "Reservación {ReservationId} cancelada por Administrador {AdminId}. " +
                    "Propietario original: {OwnerId}. Motivo: {Reason}",
                    id, userId, reservation.UserId, reason);
            }

            reservation.UpdatedAt = DateTime.UtcNow;
            return await _reservationRepository.CancelReservationAsync(id, reason);
        }

        public async Task<PaginatedReservationResponseDto> GetUserReservationsFilteredAsync(
            int userId, int page, int pageSize, string? sortBy, string? status)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var (items, totalCount) = await _reservationRepository.GetUserReservationsFilteredAsync(
                userId, page, pageSize, sortBy, status);

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