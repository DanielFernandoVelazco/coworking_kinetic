using KineticWorkspace.API.Data;
using KineticWorkspace.API.Helpers;
using KineticWorkspace.API.Models.DTOs.Auth;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Implementations;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace KineticWorkspace.API.Tests.UnitTests.Services;

public class AuthServiceTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<IRefreshTokenRepository> _refreshTokenRepoMock;
    private readonly Mock<JwtHelper> _jwtHelperMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<ILogger<AuthService>> _loggerMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);

        _userRepoMock = new Mock<IUserRepository>();
        _refreshTokenRepoMock = new Mock<IRefreshTokenRepository>();
        _jwtHelperMock = new Mock<JwtHelper>();
        _mapperMock = new Mock<IMapper>();
        _loggerMock = new Mock<ILogger<AuthService>>();

        _authService = new AuthService(
            _userRepoMock.Object,
            _refreshTokenRepoMock.Object,
            _jwtHelperMock.Object,
            _mapperMock.Object,
            _loggerMock.Object,
            _context
        );
    }

    #region Login Tests

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsLoginResponse()
    {
        // Arrange
        var user = TestDataFactory.CreateTestUser();
        var request = new LoginRequestDto
        {
            Email = "test@test.com",
            Password = "Test123!"
        };

        _userRepoMock.Setup(r => r.GetByEmailAsync("test@test.com"))
            .ReturnsAsync(user);
        _userRepoMock.Setup(r => r.UpdateLastLoginAsync(It.IsAny<int>()))
            .ReturnsAsync(true);

        _jwtHelperMock.Setup(h => h.GenerateJwtToken(It.IsAny<User>()))
            .Returns("fake-jwt-token");
        _jwtHelperMock.Setup(h => h.GenerateRefreshToken())
            .Returns("fake-refresh-token");

        _refreshTokenRepoMock.Setup(r => r.AddAsync(It.IsAny<RefreshToken>()))
            .ReturnsAsync(new RefreshToken());

        _mapperMock.Setup(m => m.Map<UserResponseDto>(It.IsAny<User>()))
            .Returns(new UserResponseDto { Id = 1, Email = "test@test.com", FullName = "Test User" });

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().Be("fake-jwt-token");
        result.RefreshToken.Should().Be("fake-refresh-token");
        result.User.Email.Should().Be("test@test.com");
    }

    [Fact]
    public async Task LoginAsync_InvalidEmail_ThrowsUnauthorized()
    {
        // Arrange
        _userRepoMock.Setup(r => r.GetByEmailAsync("wrong@test.com"))
            .ReturnsAsync((User)null!);

        var request = new LoginRequestDto
        {
            Email = "wrong@test.com",
            Password = "Test123!"
        };

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _authService.LoginAsync(request));
    }

    #endregion

    #region Register Tests

    [Fact]
    public async Task RegisterAsync_ValidData_ReturnsLoginResponse()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            FirstName = "New",
            LastName = "User",
            Email = "new@test.com",
            Password = "Test123!",
            PhoneNumber = "+46 70 123 4567",
            Company = "Test Corp"
        };

        _userRepoMock.Setup(r => r.ExistsAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
            .ReturnsAsync(false);

        _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>()))
            .ReturnsAsync(new User { Id = 2, Email = "new@test.com" });

        _jwtHelperMock.Setup(h => h.GenerateJwtToken(It.IsAny<User>()))
            .Returns("fake-jwt-token");
        _jwtHelperMock.Setup(h => h.GenerateRefreshToken())
            .Returns("fake-refresh-token");

        _refreshTokenRepoMock.Setup(r => r.AddAsync(It.IsAny<RefreshToken>()))
            .ReturnsAsync(new RefreshToken());

        _mapperMock.Setup(m => m.Map<UserResponseDto>(It.IsAny<User>()))
            .Returns(new UserResponseDto { Id = 2, Email = "new@test.com" });

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.User.Email.Should().Be("new@test.com");
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsInvalidOperation()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            FirstName = "Duplicate",
            LastName = "User",
            Email = "existing@test.com",
            Password = "Test123!"
        };

        _userRepoMock.Setup(r => r.ExistsAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
            .ReturnsAsync(true);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _authService.RegisterAsync(request));
    }

    #endregion

    public void Dispose()
    {
        _context?.Dispose();
    }
}