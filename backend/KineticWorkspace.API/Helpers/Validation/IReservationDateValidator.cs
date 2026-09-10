namespace KineticWorkspace.API.Helpers.Validation
{
    public interface IReservationDateValidator
    {
        /// <summary>
        /// Valida que el rango de fechas sea apto para una reserva o pre-reserva.
        /// Lanza InvalidOperationException con mensaje descriptivo si no lo es.
        /// </summary>
        void Validate(DateTime startTime, DateTime endTime);
    }
}