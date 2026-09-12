using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Helpers;
using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Data.SeedData.Seeders
{
    public class AdminUserSeeder
    {
        private const string AdminEmail = "admin@kineticworkspace.com";
        private const string AdminPassword = "Admin123!";

        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminUserSeeder> _logger;

        public AdminUserSeeder(ApplicationDbContext context, ILogger<AdminUserSeeder> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            var existingAdmin = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == AdminEmail);

            if (existingAdmin != null)
            {
                _logger.LogInformation("✅ Usuario Admin ya existe");
                return;
            }

            var admin = new User
            {
                FirstName = "Admin",
                LastName = "Kinetic",
                Email = AdminEmail,
                PasswordHash = PasswordHelper.HashPassword(AdminPassword),
                PhoneNumber = "+46 70 123 4567",
                Company = "Kinetic Workspace",
                JobTitle = "System Administrator",
                IsActive = true,
                IsAdmin = true,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Users.AddAsync(admin);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "✅ Usuario Admin creado ({Email} / {Password})",
                AdminEmail, AdminPassword);
        }
    }
}