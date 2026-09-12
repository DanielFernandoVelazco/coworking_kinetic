using KineticWorkspace.API.Data;
using KineticWorkspace.API.Data.SeedData;
using KineticWorkspace.API.Helpers;
using KineticWorkspace.API.Helpers.Formatting;
using KineticWorkspace.API.Helpers.Pricing;
using KineticWorkspace.API.Helpers.Validation;
using KineticWorkspace.API.Mappings;
using KineticWorkspace.API.Repositories.Implementations;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Implementations;
using KineticWorkspace.API.Services.Implementations.Admin;
using KineticWorkspace.API.Services.Implementations.Payments;
using KineticWorkspace.API.Services.Implementations.Spaces;
using KineticWorkspace.API.Services.Implementations.Users;
using KineticWorkspace.API.Services.Interfaces;
using KineticWorkspace.API.Services.Interfaces.Admin;
using KineticWorkspace.API.Services.Interfaces.Spaces;
using KineticWorkspace.API.Services.Interfaces.Users;
using KineticWorkspace.API.Data.SeedData.Seeders;

namespace KineticWorkspace.API.Extensions
{
    public static class DependencyInjectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // ========== REPOSITORIOS ==========
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<ISpaceRepository, SpaceRepository>();
            services.AddScoped<IReservationRepository, ReservationRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            services.AddScoped<IAlertRepository, AlertRepository>();
            services.AddScoped<IAmenityRepository, AmenityRepository>();

            // ========== HELPERS ==========
            services.AddScoped<IJwtHelper, JwtHelper>();
            services.AddScoped<IReservationDateValidator, ReservationDateValidator>();
            services.AddScoped<IPricingCalculator, PricingCalculator>();
            services.AddScoped<ITimeAgoFormatter, TimeAgoFormatter>();

            // ========== SERVICES: AUTH ==========
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IPasswordResetService, PasswordResetService>();

            // ========== SERVICES: USERS ==========
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IUserProfileService, UserProfileService>();
            services.AddScoped<IUserAdminService, UserAdminService>();

            // ========== SERVICES: SPACES ==========
            services.AddScoped<ISpaceService, SpaceService>();
            services.AddScoped<ISpaceAvailabilityService, SpaceAvailabilityService>();
            services.AddScoped<ISpaceAmenityService, SpaceAmenityService>();

            // ========== SERVICES: RESERVATIONS ==========
            services.AddScoped<IReservationService, ReservationService>();
            services.AddScoped<IPreReservationService, PreReservationService>();
            services.AddScoped<IInvoiceService, InvoiceService>();
            services.AddScoped<IPaymentProcessorService, PaymentProcessorService>();

            // ========== SERVICES: ALERTS & AMENITIES ==========
            services.AddScoped<IAlertService, AlertService>();
            services.AddScoped<IAmenityService, AmenityService>();

            // ========== SERVICES: ADMIN ==========
            services.AddScoped<IAdminService, AdminService>();
            services.AddScoped<IAdminDashboardService, AdminDashboardService>();
            services.AddScoped<IAdminReportService, AdminReportService>();
            services.AddScoped<IAdminAlertService, AdminAlertService>();

            // ========== SEEDERS ==========
            services.AddScoped<DataSeeder>();
            services.AddScoped<SeederDataUser>();
            services.AddScoped<AmenitySeeder>();
            services.AddScoped<SpaceSeeder>();
            services.AddScoped<AdminUserSeeder>();

            // ========== AUTOMAPPER ==========
            services.AddAutoMapper(typeof(MappingProfile).Assembly);

            return services;
        }
    }
}