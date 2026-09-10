namespace KineticWorkspace.API.Helpers.Validation
{
    public class ReservationDateValidator : IReservationDateValidator
    {
        private static readonly TimeSpan MaxDuration = TimeSpan.FromDays(30);
        private static readonly TimeSpan MinDuration = TimeSpan.FromMinutes(30);

        public void Validate(DateTime startTime, DateTime endTime)
        {
            if (startTime >= endTime)
                throw new InvalidOperationException("La fecha de inicio debe ser anterior a la fecha de fin");

            if (startTime < DateTime.UtcNow.AddMinutes(-1))
                throw new InvalidOperationException("No se pueden hacer reservas en el pasado");

            if (endTime - startTime > MaxDuration)
                throw new InvalidOperationException($"La duración máxima es de {MaxDuration.Days} días");

            if (endTime - startTime < MinDuration)
                throw new InvalidOperationException($"La duración mínima es de {MinDuration.Minutes} minutos");
        }
    }
}