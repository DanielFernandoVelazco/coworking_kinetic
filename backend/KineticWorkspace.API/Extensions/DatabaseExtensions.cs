using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;

namespace KineticWorkspace.API.Extensions
{
    public static class DatabaseExtensions
    {
        public static IServiceCollection AddDatabase(
            this IServiceCollection services,
            IConfiguration configuration,
            IWebHostEnvironment environment)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");

                options.UseMySql(
                    connectionString,
                    new MySqlServerVersion(new Version(10, 4, 32)),
                    mysqlOptions =>
                    {
                        mysqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 3,
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorNumbersToAdd: null
                        );
                    }
                );

                options.EnableSensitiveDataLogging(environment.IsDevelopment());
                options.EnableDetailedErrors(environment.IsDevelopment());
            });

            return services;
        }
    }
}