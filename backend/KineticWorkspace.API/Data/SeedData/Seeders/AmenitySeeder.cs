using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data.SeedData.SeedCatalogs;
using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Data.SeedData.Seeders
{
    public class AmenitySeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AmenitySeeder> _logger;

        public AmenitySeeder(ApplicationDbContext context, ILogger<AmenitySeeder> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            var allAmenities = AmenityCatalog.BySpaceType.Values
                .SelectMany(a => a)
                .Distinct()
                .ToList();

            var existingAmenities = await _context.Amenities
                .Select(a => a.Name)
                .ToListAsync();

            var newAmenities = allAmenities
                .Where(a => !existingAmenities.Contains(a))
                .Select(name => new Amenity
                {
                    Name = name,
                    Description = $"{name} para espacios de trabajo",
                    IsActive = true
                })
                .ToList();

            if (newAmenities.Any())
            {
                await _context.Amenities.AddRangeAsync(newAmenities);
                await _context.SaveChangesAsync();
                _logger.LogInformation("✅ {Count} amenidades creadas", newAmenities.Count);
            }
        }
    }
}