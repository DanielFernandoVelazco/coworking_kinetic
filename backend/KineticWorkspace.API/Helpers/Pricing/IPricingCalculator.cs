using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Helpers.Pricing
{
    public interface IPricingCalculator
    {
        /// <summary>
        /// Calcula el precio total de una reserva según las tarifas del espacio.
        /// Aplica precio por día cuando corresponde, y precio por hora para el remanente.
        /// </summary>
        decimal Calculate(Space space, DateTime startTime, DateTime endTime);
    }
}