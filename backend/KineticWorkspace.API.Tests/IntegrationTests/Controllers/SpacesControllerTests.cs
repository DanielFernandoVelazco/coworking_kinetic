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
    public async Task GetSpaceById_ExistingId_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/spaces/1");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var space = await response.Content.ReadFromJsonAsync<SpaceResponseDto>();
        space.Should().NotBeNull();
        space!.Id.Should().Be(1);
    }

    [Fact]
    public async Task GetSpaceById_NonExistingId_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/spaces/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetAvailableSpaces_ReturnsOk()
    {
        // Arrange
        var startTime = DateTime.UtcNow.AddHours(2);
        var endTime = DateTime.UtcNow.AddHours(4);

        // Act
        var response = await _client.GetAsync(
            $"/api/spaces/available?startTime={startTime:O}&endTime={endTime:O}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var spaces = await response.Content.ReadFromJsonAsync<List<SpaceResponseDto>>();
        spaces.Should().NotBeNull();
    }

    [Fact]
    public async Task GetSpacesByCity_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/spaces/city/Stockholm");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var spaces = await response.Content.ReadFromJsonAsync<List<SpaceResponseDto>>();
        spaces.Should().NotBeNull();
    }

    [Fact]
    public async Task SearchSpaces_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/spaces/search?term=Office");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var spaces = await response.Content.ReadFromJsonAsync<List<SpaceResponseDto>>();
        spaces.Should().NotBeNull();
    }

    [Fact]
    public async Task CheckAvailability_ReturnsOk()
    {
        // Arrange
        var startTime = DateTime.UtcNow.AddHours(2);
        var endTime = DateTime.UtcNow.AddHours(4);

        // Act
        var response = await _client.GetAsync(
            $"/api/spaces/1/availability?startTime={startTime:O}&endTime={endTime:O}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<object>();
        result.Should().NotBeNull();
    }

    #endregion

    #region POST Tests (Admin)

    [Fact]
    public async Task CreateSpace_AsAdmin_ReturnsCreated()
    {
        // Arrange
        var request = new SpaceRequestDto
        {
            Name = "New Test Space",
            Description = "Test description",
            Type = "Premium Office",
            Capacity = 10,
            PricePerHour = 50m,
            PricePerDay = 300m,
            Address = "Test Street 123",
            City = "Stockholm",
            District = "Test District",
            Country = "Sweden",
            IsAvailable = true,
            IsFeatured = false
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/spaces", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var space = await response.Content.ReadFromJsonAsync<SpaceResponseDto>();
        space.Should().NotBeNull();
        space!.Name.Should().Be("New Test Space");
    }

    #endregion
}