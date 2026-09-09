using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using KineticWorkspace.API.Data;
using Microsoft.Extensions.DependencyInjection;

namespace KineticWorkspace.API.Tests.IntegrationTests.Controllers;

public class SpacesControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public SpacesControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET Tests (Públicos)

    [Fact]
    public async Task GetAllSpaces_ReturnsOk()
    {
        // Arrange: Seed data first
        await SeedDataAsync();

        // Act
        var response = await _client.GetAsync("/api/spaces");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private async Task SeedDataAsync()
    {
        // Agregar datos de prueba antes de ejecutar los tests
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (!db.Spaces.Any())
        {
            db.Spaces.Add(TestDataFactory.CreateTestSpace());
            await db.SaveChangesAsync();
        }
    }

    [Fact]
    public async Task GetAllSpacesUnpaginated_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/spaces/all");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var spaces = await response.Content.ReadFromJsonAsync<List<SpaceResponseDto>>();
        spaces.Should().NotBeNull();
    }

    [Fact]
    public async Task GetFeaturedSpaces_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/spaces/featured?limit=5");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var spaces = await response.Content.ReadFromJsonAsync<List<SpaceResponseDto>>();
        spaces.Should().NotBeNull();
    }

    [Fact]
    public async Task GetSpaceById_NonExistingId_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/spaces/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion
}