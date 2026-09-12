using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using KineticWorkspace.API.Data;

namespace KineticWorkspace.API.Extensions
{
    public static class HealthCheckExtensions
    {
        public static IServiceCollection AddCustomHealthChecks(this IServiceCollection services)
        {
            services.AddHealthChecks()
                .AddDbContextCheck<ApplicationDbContext>("Database");

            return services;
        }

        public static WebApplication MapCustomHealthChecks(this WebApplication app)
        {
            app.MapHealthChecks("/health", new HealthCheckOptions
            {
                ResponseWriter = async (context, report) =>
                {
                    context.Response.ContentType = "application/json";
                    var response = new
                    {
                        status = report.Status.ToString(),
                        checks = report.Entries.Select(e => new
                        {
                            name = e.Key,
                            status = e.Value.Status.ToString(),
                            description = e.Value.Description
                        })
                    };
                    await context.Response.WriteAsJsonAsync(response);
                }
            });

            return app;
        }
    }
}