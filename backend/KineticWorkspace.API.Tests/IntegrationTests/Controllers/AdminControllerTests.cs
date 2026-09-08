using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using KineticWorkspace.API.Models.DTOs.Admin;
using KineticWorkspace.API.Models.DTOs.Auth;
using Microsoft.AspNetCore.Mvc.Testing;

namespace KineticWorkspace.API.Tests.IntegrationTests.Controllers;

public class AdminControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AdminControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    #region Authentication Helper

    private async Task<string> GetAdminToken()
    {
        var loginRequest = new LoginRequestDto
        {
            Email = "admin@kineticworkspace.com",
            Password = "Admin123!"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        var content = await response.Content.ReadFromJsonAsync<LoginResponseDto>();
        return content!.AccessToken;
    }

    #endregion

    #region Dashboard Tests

    [Fact]
    public async Task GetDashboard_AsAdmin_ReturnsOk()
    {
        // Arrange
        var token = await GetAdminToken();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/admin/dashboard");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var data = await response.Content.ReadFromJsonAsync<AdminDashboardDto>();
        data.Should().NotBeNull();
        data!.Summary.Should().NotBeNull();
    }

    [Fact]
    public async Task GetDashboard_WithoutAuth_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/admin/dashboard");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetSummary_AsAdmin_ReturnsOk()
    {
        // Arrange
        var token = await GetAdminToken();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/admin/summary");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var data = await response.Content.ReadFromJsonAsync<SummaryMetricsDto>();
        data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetMonthlyReservations_AsAdmin_ReturnsOk()
    {
        // Arrange
        var token = await GetAdminToken();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/admin/monthly-reservations?months=6");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var data = await response.Content.ReadFromJsonAsync<List<MonthlyMetricDto>>();
        data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetMonthlyRevenue_AsAdmin_ReturnsOk()
    {
        // Arrange
        var token = await GetAdminToken();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/admin/monthly-revenue?months=6");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var data = await response.Content.ReadFromJsonAsync<List<MonthlyMetricDto>>();
        data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetRecentReservations_AsAdmin_ReturnsOk()
    {
        // Arrange
        var token = await GetAdminToken();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/admin/recent-reservations?limit=5");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var data = await response.Content.ReadFromJsonAsync<List<RecentReservationDto>>();
        data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetTopUsers_AsAdmin_ReturnsOk()
    {
        // Arrange
        var token = await GetAdminToken();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/admin/top-users?limit=5");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var data = await response.Content.ReadFromJsonAsync<List<TopUserDto>>();
        data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetTopSpaces_AsAdmin_ReturnsOk()
    {
        // Arrange
        var token = await GetAdminToken();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/admin/top-spaces?limit=5");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var data = await response.Content.ReadFromJsonAsync<List<TopSpaceDto>>();
        data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetSystemHealth_AsAdmin_ReturnsOk()
    {
        // Arrange
        var token = await GetAdminToken();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/admin/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var data = await response.Content.ReadFromJsonAsync<SystemHealthDto>();
        data.Should().NotBeNull();
        data!.ApiOk.Should().BeTrue();
    }

    #endregion

    #region Export Tests

    [Fact]
    public async Task ExportReport_AsAdmin_ReturnsFile()
    {
        // Arrange
        var token = await GetAdminToken();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var startDate = DateTime.UtcNow.AddMonths(-1);
        var endDate = DateTime.UtcNow;

        // Act
        var response = await _client.GetAsync(
            $"/api/admin/export?startDate={startDate:O}&endDate={endDate:O}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType!.MediaType.Should().Be(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.Content.Headers.ContentDisposition!.FileName.Should().Contain(".xlsx");
    }

    [Fact]
    public async Task ExportReport_WithoutAuth_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/admin/export");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    #endregion

    #region Alert Tests (Admin)

    [Fact]
    public async Task GetAllAlerts_AsAdmin_ReturnsOk()
    {
        // Arrange
        var token = await GetAdminToken();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/admin/alerts");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var data = await response.Content.ReadFromJsonAsync<List<AlertResponseDto>>();
        data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetAlertStats_AsAdmin_ReturnsOk()
    {
        // Arrange
        var token = await GetAdminToken();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/admin/alerts/stats");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var data = await response.Content.ReadFromJsonAsync<AlertStatsDto>();
        data.Should().NotBeNull();
    }

    [Fact]
    public async Task BroadcastAlert_AsAdmin_ReturnsOk()
    {
        // Arrange
        var token = await GetAdminToken();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var request = new AlertRequestDto
        {
            Title = "Test Broadcast",
            Message = "This is a test broadcast message",
            Type = "info",
            Category = "general"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/admin/alerts/broadcast", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    #endregion
}