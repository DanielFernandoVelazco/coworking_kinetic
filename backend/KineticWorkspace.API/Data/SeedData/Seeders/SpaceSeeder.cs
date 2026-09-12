using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data.SeedData.SeedCatalogs;
using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Data.SeedData.Seeders
{
    public class SpaceSeeder
    {
        private const int SpacesPerType = 15;

        private static readonly List<string> SpaceTypes = new()
        {
            "Premium Office",
            "Meeting Room",
            "Dedicated Desk",
            "Focus Pod",
            "Creative Space"
        };

        private readonly ApplicationDbContext _context;
        private readonly ILogger<SpaceSeeder> _logger;
        private readonly Random _random = new();

        public SpaceSeeder(ApplicationDbContext context, ILogger<SpaceSeeder> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            var allAmenities = await _context.Amenities.ToListAsync();

            foreach (var type in SpaceTypes)
            {
                _logger.LogInformation("📝 Creando {Count} espacios de tipo: {Type}", SpacesPerType, type);

                var typeAmenities = AmenityCatalog.BySpaceType[type];
                var amenities = allAmenities
                    .Where(a => typeAmenities.Contains(a.Name))
                    .ToList();

                var images = ImageUrlCatalog.BySpaceType[type];

                for (int i = 0; i < SpacesPerType; i++)
                {
                    var space = BuildSpace(type, i, amenities, images);
                    await _context.Spaces.AddAsync(space);
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("✅ {Count} espacios de tipo '{Type}' creados", SpacesPerType, type);
            }

            _logger.LogInformation("✅ Todos los espacios creados exitosamente!");
        }

        // ==================== HELPERS ====================

        private Space BuildSpace(string type, int index, List<Amenity> amenities, List<string> images)
        {
            var nameSuffix = SpaceNameCatalog.Names[_random.Next(SpaceNameCatalog.Names.Count)];
            var city = LocationCatalog.Cities[_random.Next(LocationCatalog.Cities.Count)];
            var district = LocationCatalog.Districts[_random.Next(LocationCatalog.Districts.Count)];
            var street = LocationCatalog.Streets[_random.Next(LocationCatalog.Streets.Count)];
            var streetNumber = _random.Next(1, 100);

            var capacity = GetCapacity(type);
            var pricePerHour = GetPricePerHour(type);
            var pricePerDay = GetPricePerDay(type, pricePerHour);

            var space = new Space
            {
                Name = $"{nameSuffix} {type}",
                Description = GenerateDescription(type, capacity),
                Type = type,
                Capacity = capacity,
                PricePerHour = pricePerHour,
                PricePerDay = pricePerDay,
                Address = $"{street} {streetNumber}",
                City = city,
                District = district,
                PostalCode = $"{_random.Next(10000, 99999)}",
                Country = "Sweden",
                ImageUrls = string.Join(",", images),
                IsAvailable = true,
                IsFeatured = index < 3,
                IsActive = true,
                Latitude = 59.3293 + (_random.NextDouble() - 0.5) * 0.1,
                Longitude = 18.0686 + (_random.NextDouble() - 0.5) * 0.1,
                CreatedAt = DateTime.UtcNow.AddDays(-_random.Next(1, 60))
            };

            // Asignar entre 4 y todas las amenidades
            space.Amenities = amenities
                .OrderBy(_ => _random.Next())
                .Take(_random.Next(4, amenities.Count + 1))
                .ToList();

            return space;
        }

        private int GetCapacity(string type) => type switch
        {
            "Premium Office" => _random.Next(4, 20),
            "Meeting Room" => _random.Next(6, 25),
            "Dedicated Desk" => _random.Next(1, 4),
            "Focus Pod" => 1,
            "Creative Space" => _random.Next(8, 30),
            _ => 10
        };

        private int GetPricePerHour(string type) => type switch
        {
            "Premium Office" => _random.Next(40, 80),
            "Meeting Room" => _random.Next(25, 55),
            "Dedicated Desk" => _random.Next(15, 35),
            "Focus Pod" => _random.Next(10, 25),
            "Creative Space" => _random.Next(30, 60),
            _ => 30
        };

        private decimal GetPricePerDay(string type, int pricePerHour)
        {
            var discount = type switch
            {
                "Premium Office" => 0.8m,
                "Meeting Room" => 0.75m,
                "Dedicated Desk" => 0.7m,
                "Focus Pod" => 0.8m,
                "Creative Space" => 0.75m,
                _ => 0.75m
            };

            return pricePerHour * 6 * discount;
        }

        private string GenerateDescription(string type, int capacity)
        {
            var templates = DescriptionCatalog.BySpaceType[type];
            var template = templates[_random.Next(templates.Count)];
            return template.Replace("{capacity}", capacity.ToString());
        }
    }
}