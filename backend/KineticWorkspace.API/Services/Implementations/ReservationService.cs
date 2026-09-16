using KineticWorkspace.API.Models.DTOs.Reservations;
using KineticWorkspace.API.Services.Interfaces;
using KineticWorkspace.API.Services.Interfaces.Reservations;

namespace KineticWorkspace.API.Services.Implementations
{
    /// <summary>
    /// Fachada que delega a los servicios especializados de reservas.
    /// Se mantiene para no romper ReservationsController.
    /// </summary>
    public class ReservationService : IReservationService
    {
        private readonly IUserReservationService _userService;
        private readonly IAdminReservationService _adminService;

        public ReservationService(
            IUserReservationService userService,
            IAdminReservationService adminService)
        {
            _userService = userService;
            _adminService = adminService;
        }

        // ========== USER ==========
        public Task<IEnumerable<ReservationResponseDto>> GetUserReservationsAsync(int userId)
            => _userService.GetUserReservationsAsync(userId);

        public Task<IEnumerable<ReservationResponseDto>> GetUpcomingReservationsAsync(int userId, int limit = 10)
            => _userService.GetUpcomingReservationsAsync(userId, limit);

        public Task<ReservationSummaryDto> GetReservationSummaryAsync(int userId)
            => _userService.GetReservationSummaryAsync(userId);

        public Task<ReservationResponseDto?> GetReservationByIdAsync(int id)
            => _userService.GetReservationByIdAsync(id);

        public Task<IEnumerable<ReservationResponseDto>> GetSpaceReservationsAsync(int spaceId)
            => _userService.GetSpaceReservationsAsync(spaceId);

        public Task<ReservationResponseDto> CreateReservationAsync(ReservationRequestDto request, int userId)
            => _userService.CreateReservationAsync(request, userId);

        public Task<ReservationResponseDto?> UpdateReservationAsync(
            int id, ReservationRequestDto request, int userId, bool isAdmin = false)
            => _userService.UpdateReservationAsync(id, request, userId, isAdmin);

        public Task<bool> CancelReservationAsync(int id, int userId, string reason, bool isAdmin = false)
            => _userService.CancelReservationAsync(id, userId, reason, isAdmin);

        public Task<PaginatedReservationResponseDto> GetUserReservationsFilteredAsync(
            int userId, int page, int pageSize, string? sortBy, string? status)
            => _userService.GetUserReservationsFilteredAsync(userId, page, pageSize, sortBy, status);

        // ========== ADMIN ==========
        public Task<IEnumerable<ReservationResponseDto>> GetActiveReservationsAsync()
            => _adminService.GetActiveReservationsAsync();

        public Task<bool> ConfirmReservationAsync(int id, int adminUserId)
            => _adminService.ConfirmReservationAsync(id, adminUserId);

        public Task<PaginatedReservationResponseDto> GetAllReservationsFilteredAsync(
            int page, int pageSize, string? sortBy, string? status,
            string? searchTerm, int? userId, int? spaceId)
            => _adminService.GetAllReservationsFilteredAsync(
                page, pageSize, sortBy, status, searchTerm, userId, spaceId);
    }
}