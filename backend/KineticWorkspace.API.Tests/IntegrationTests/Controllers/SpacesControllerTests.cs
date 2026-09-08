using System.Net;
using System.Net.Http.Json;
using KineticWorkspace.API.Models.DTOs.Spaces;
using Microsoft.AspNetCore.Mvc.Testing;

namespace KineticWorkspace.API.Tests.IntegrationTests.Controllers;

public class SpacesControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public SpacesControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    #region GET Tests (Públicos)

    [Fact]
    public async Task GetAllSpaces_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/spaces");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var spaces = await response.Content.ReadFromJsonAsync<List<SpaceResponseDto>>();
        spaces.Should().NotBeNull();
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