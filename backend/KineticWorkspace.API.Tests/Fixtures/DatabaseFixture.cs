using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace KineticWorkspace.API.Tests.Fixtures;

public class DatabaseFixture : IDisposable
{
    public ApplicationDbContext Context { get; private set; }
    private readonly DbContextOptions<ApplicationDbContext> _options;

    public DatabaseFixture()
    {
        var databaseName = Guid.NewGuid().ToString();
        _options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        Context = new ApplicationDbContext(_options);
        SeedDatabase();
    }

    private void SeedDatabase()
    {
        // Agregar datos de prueba
        Context.Users.AddRange(TestDataFactory.CreateTestUser());
        Context.Spaces.AddRange(TestDataFactory.CreateTestSpace());
        Context.SaveChanges();
    }

    public void Dispose()
    {
        Context?.Dispose();
    }
}