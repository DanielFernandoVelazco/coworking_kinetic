// backend/KineticWorkspace.API/Data/DataSeeder.cs
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Helpers;
using Microsoft.EntityFrameworkCore;

namespace KineticWorkspace.API.Data
{
    public class DataSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DataSeeder> _logger;

        // Espacios de ejemplo para cada tipo
        private readonly List<string> _spaceNames = new()
        {
            "Skyline", "Zen", "Apex", "Vista", "Nova",
            "Eclipse", "Pulse", "Summit", "Orbit", "Haven",
            "Valor", "Aura", "Flux", "Vertex", "Apex"
        };

        private readonly List<string> _cities = new()
        {
            "Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås",
            "Örebro", "Linköping", "Helsingborg", "Jönköping", "Norrköping"
        };

        private readonly List<string> _districts = new()
        {
            "Östermalm", "Vasastan", "Södermalm", "Kungsholmen", "Norrmalm",
            "Linnéstaden", "Haga", "Johanneberg", "Mölndal", "Centrum"
        };

        private readonly List<string> _streets = new()
        {
            "Sveavägen", "Kungsgatan", "Drottninggatan", "Hamngatan", "Birger Jarlsgatan",
            "Avenyn", "Kungsportsavenyn", "Vasaplatsen", "Götaplatsen", "Södra Vägen",
            "Stortorget", "Gustav Adolfs Torg", "Lilla Torg", "Triangeln", "Möllevångstorget"
        };

        // Servicios/amenidades por tipo
        private readonly Dictionary<string, List<string>> _amenitiesByType = new()
        {
            ["Premium Office"] = new() {
                "High-speed WiFi", "Ergonomic Chairs", "Standing Desks",
                "Meeting Rooms", "Private Kitchen", "24/7 Access",
                "Security System", "Cleaning Service", "Coffee Bar", "Printing Service"
            },
            ["Meeting Room"] = new() {
                "High-speed WiFi", "Video Conference", "Whiteboard",
                "Projector", "Smart TV", "Conference Phone",
                "HDMI Connectivity", "Sound System", "Coffee Service", "Natural Light"
            },
            ["Dedicated Desk"] = new() {
                "High-speed WiFi", "Ergonomic Chair", "Standing Desk",
                "Storage Lockers", "Access to Kitchen", "Community Events",
                "24/7 Access", "Printing Service", "Phone Booths", "Coffee Bar"
            },
            ["Focus Pod"] = new() {
                "High-speed WiFi", "Soundproofing", "Ergonomic Chair",
                "Desk Lamp", "Power Outlets", "Privacy Glass",
                "Air Purifier", "Plant Decor", "Minimalist Design", "Smart Lighting"
            },
            ["Creative Space"] = new() {
                "High-speed WiFi", "Creative Equipment", "Open Floor Plan",
                "Art Supplies", "Standing Desks", "Community Board",
                "Natural Light", "Collaboration Tools", "Whiteboard Walls", "Coffee Bar"
            }
        };

        // URLs de imágenes por tipo (ejemplos)
        private readonly Dictionary<string, List<string>> _imageUrlsByType = new()
        {
            ["Premium Office"] = new() {
                "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
                "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
                "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800"
            },
            ["Meeting Room"] = new() {
                "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
                "https://images.unsplash.com/photo-1597755602304-554bdc3c2688?w=800",
                "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800"
            },
            ["Dedicated Desk"] = new() {
                "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800",
                "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
                "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800"
            },
            ["Focus Pod"] = new() {
                "https://images.unsplash.com/photo-1534073737924-14d5cf6abc7f?w=800",
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
                "https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=800"
            },
            ["Creative Space"] = new() {
                "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
                "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800",
                "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800"
            }
        };

        public DataSeeder(ApplicationDbContext context, ILogger<DataSeeder> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SeedAllAsync()
        {
            try
            {
                _logger.LogInformation("🔄 Iniciando verificación de datos iniciales...");

                // Verificar si ya hay datos
                var existingSpaces = await _context.Spaces.CountAsync();
                if (existingSpaces > 0)
                {
                    _logger.LogInformation($"✅ Ya existen {existingSpaces} espacios en la base de datos. Saltando seed.");
                    return;
                }

                _logger.LogInformation("📦 No se encontraron datos. Iniciando precarga de 75 espacios...");

                // 1. Crear Amenities si no existen
                await SeedAmenitiesAsync();

                // 2. Crear 15 espacios por cada tipo
                await SeedSpacesAsync();

                // 3. Crear un usuario admin por defecto
                await SeedAdminUserAsync();

                _logger.LogInformation("✅ Precarga de datos completada exitosamente!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error durante la precarga de datos");
                throw;
            }
        }

        private async Task SeedAmenitiesAsync()
        {
            var allAmenities = _amenitiesByType.Values
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
                _logger.LogInformation($"✅ {newAmenities.Count} amenidades creadas");
            }
        }

        private async Task SeedSpacesAsync()
        {
            var types = new List<string>
            {
                "Premium Office",
                "Meeting Room",
                "Dedicated Desk",
                "Focus Pod",
                "Creative Space"
            };

            // Obtener todas las amenidades para hacer el mapeo
            var allAmenities = await _context.Amenities.ToListAsync();
            var random = new Random();

            foreach (var type in types)
            {
                _logger.LogInformation($"📝 Creando 15 espacios de tipo: {type}");

                var typeAmenities = _amenitiesByType[type];
                var amenities = allAmenities
                    .Where(a => typeAmenities.Contains(a.Name))
                    .ToList();

                var images = _imageUrlsByType[type];

                for (int i = 0; i < 15; i++)
                {
                    var nameSuffix = _spaceNames[random.Next(_spaceNames.Count)];
                    var city = _cities[random.Next(_cities.Count)];
                    var district = _districts[random.Next(_districts.Count)];
                    var street = _streets[random.Next(_streets.Count)];
                    var streetNumber = random.Next(1, 100);

                    var capacity = type switch
                    {
                        "Premium Office" => random.Next(4, 20),
                        "Meeting Room" => random.Next(6, 25),
                        "Dedicated Desk" => random.Next(1, 4),
                        "Focus Pod" => 1,
                        "Creative Space" => random.Next(8, 30),
                        _ => 10
                    };

                    var pricePerHour = type switch
                    {
                        "Premium Office" => random.Next(40, 80),
                        "Meeting Room" => random.Next(25, 55),
                        "Dedicated Desk" => random.Next(15, 35),
                        "Focus Pod" => random.Next(10, 25),
                        "Creative Space" => random.Next(30, 60),
                        _ => 30
                    };

                    var pricePerDay = type switch
                    {
                        "Premium Office" => pricePerHour * 6 * 0.8m, // 20% descuento día
                        "Meeting Room" => pricePerHour * 6 * 0.75m,
                        "Dedicated Desk" => pricePerHour * 6 * 0.7m,
                        "Focus Pod" => pricePerHour * 6 * 0.8m,
                        "Creative Space" => pricePerHour * 6 * 0.75m,
                        _ => pricePerHour * 6 * 0.75m
                    };

                    var space = new Space
                    {
                        Name = $"{nameSuffix} {type}",
                        Description = GenerateDescription(type, nameSuffix, capacity),
                        Type = type,
                        Capacity = capacity,
                        PricePerHour = pricePerHour,
                        PricePerDay = pricePerDay,
                        Address = $"{street} {streetNumber}",
                        City = city,
                        District = district,
                        PostalCode = $"{random.Next(10000, 99999)}",
                        Country = "Sweden",
                        ImageUrls = string.Join(",", images),
                        IsAvailable = true,
                        IsFeatured = i < 3, // Los primeros 3 de cada tipo son destacados
                        IsActive = true,
                        Latitude = 59.3293 + (random.NextDouble() - 0.5) * 0.1,
                        Longitude = 18.0686 + (random.NextDouble() - 0.5) * 0.1,
                        CreatedAt = DateTime.UtcNow.AddDays(-random.Next(1, 60))
                    };

                    // Asignar amenidades (entre 4 y todas)
                    var selectedAmenities = amenities
                        .OrderBy(_ => random.Next())
                        .Take(random.Next(4, amenities.Count + 1))
                        .ToList();

                    space.Amenities = selectedAmenities;

                    await _context.Spaces.AddAsync(space);
                }

                // Guardar cada lote de 15
                await _context.SaveChangesAsync();
                _logger.LogInformation($"✅ 15 espacios de tipo '{type}' creados");
            }

            _logger.LogInformation("✅ Todos los espacios creados exitosamente!");
        }

        private string GenerateDescription(string type, string name, int capacity)
        {
            var descriptions = new Dictionary<string, List<string>>
            {
                ["Premium Office"] = new()
                {
                    $"A premium office space designed for productivity and comfort. Perfect for teams of up to {capacity} people.",
                    $"Executive office with modern amenities and stunning views. Accommodates {capacity} professionals comfortably.",
                    $"High-end workspace in the heart of the city. Ideal for {capacity} team members with all necessary equipment."
                },
                ["Meeting Room"] = new()
                {
                    $"Professional meeting room with state-of-the-art technology. Comfortably seats up to {capacity} participants.",
                    $"Fully equipped meeting room perfect for presentations and collaborative sessions. Capacity: {capacity} people.",
                    $"Modern meeting space with video conferencing capabilities. Suitable for groups of {capacity}."
                },
                ["Dedicated Desk"] = new()
                {
                    $"Your personal workspace in a vibrant community. Ergonomic setup for focused work.",
                    $"Dedicated desk with all the essentials for productive days. Join our professional community.",
                    $"A permanent workspace where you can leave your equipment. Perfect for remote professionals."
                },
                ["Focus Pod"] = new()
                {
                    $"A quiet, private space designed for deep focus and concentration. Soundproofed for maximum productivity.",
                    $"Private pod for distraction-free work. Ideal for calls, writing, and focused tasks.",
                    $"Your personal retreat in a professional setting. Perfect for focused work sessions."
                },
                ["Creative Space"] = new()
                {
                    $"An inspiring, open environment designed to foster creativity and collaboration. Features a unique atmosphere.",
                    $"A dynamic space where ideas come to life. Perfect for creative professionals and teams.",
                    $"A versatile space for brainstorming, workshops, and creative projects."
                }
            };

            var typeDescriptions = descriptions[type];
            var random = new Random();
            var description = typeDescriptions[random.Next(typeDescriptions.Count)];

            return description;
        }

        private async Task SeedAdminUserAsync()
        {
            var adminEmail = "admin@kineticworkspace.com";
            var existingAdmin = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == adminEmail);

            if (existingAdmin == null)
            {
                var admin = new User
                {
                    FirstName = "Admin",
                    LastName = "Kinetic",
                    Email = adminEmail,
                    PasswordHash = PasswordHelper.HashPassword("Admin123!"),
                    PhoneNumber = "+46 70 123 4567",
                    Company = "Kinetic Workspace",
                    JobTitle = "System Administrator",
                    IsActive = true,
                    IsAdmin = true,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.Users.AddAsync(admin);
                await _context.SaveChangesAsync();

                _logger.LogInformation("✅ Usuario Admin creado (admin@kineticworkspace.com / Admin123!)");
            }
            else
            {
                _logger.LogInformation("✅ Usuario Admin ya existe");
            }
        }
    }
}