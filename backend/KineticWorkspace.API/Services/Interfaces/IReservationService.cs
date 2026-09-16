using KineticWorkspace.API.Services.Interfaces.Reservations;

namespace KineticWorkspace.API.Services.Interfaces
{
    /// <summary>
    /// Interfaz fachada. Hereda de las interfaces segregadas.
    /// Se mantiene para no romper ReservationsController.
    /// </summary>
    public interface IReservationService : IUserReservationService, IAdminReservationService
    {
    }
}