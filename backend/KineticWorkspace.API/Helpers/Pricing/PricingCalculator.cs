using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Helpers.Pricing
{
    public class PricingCalculator : IPricingCalculator
    {
        public decimal Calculate(Space space, DateTime startTime, DateTime endTime)
        {
            var totalHours = (endTime - startTime).TotalHours;
            var totalDays = (endTime.Date - startTime.Date).Days;

            if (totalDays >= 1 && space.PricePerDay.HasValue && space.PricePerDay.Value > 0)
            {
                var days = totalDays;
                var remainingHours = totalHours % 24;
                return (decimal)days * space.PricePerDay.Value
                     + (decimal)remainingHours * space.PricePerHour;
            }

            return space.PricePerHour * (decimal)totalHours;
        }
    }
}