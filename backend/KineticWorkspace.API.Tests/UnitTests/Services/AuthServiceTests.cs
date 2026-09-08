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
        // Configurar DbContext en memoria
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

    [Fact]
    public async Task LoginAsync_WrongPassword_ThrowsUnauthorized()
    {
        // Arrange
        var user = TestDataFactory.CreateTestUser();
        _userRepoMock.Setup(r => r.GetByEmailAsync("test@test.com"))
            .ReturnsAsync(user);

        var request = new LoginRequestDto
        {
            Email = "test@test.com",
            Password = "WrongPassword!"
        };

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _authService.LoginAsync(request));
    }

    [Fact]
    public async Task LoginAsync_InactiveUser_ThrowsUnauthorized()
    {
        // Arrange
        var user = TestDataFactory.CreateTestUser();
        user.IsActive = false;

        _userRepoMock.Setup(r => r.GetByEmailAsync("test@test.com"))
            .ReturnsAsync(user);

        var request = new LoginRequestDto
        {
            Email = "test@test.com",
            Password = "Test123!"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _authService.LoginAsync(request));
        exception.Message.Should().Contain("Cuenta desactivada");
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

    #region Refresh Token Tests

    [Fact]
    public async Task RefreshTokenAsync_ValidToken_ReturnsNewTokens()
    {
        // Arrange
        var refreshTokenEntity = new RefreshToken
        {
            Id = 1,
            UserId = 1,
            Token = "valid-refresh-token",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        };

        var user = TestDataFactory.CreateTestUser();

        _refreshTokenRepoMock.Setup(r => r.GetByTokenAsync("valid-refresh-token"))
            .ReturnsAsync(refreshTokenEntity);

        _userRepoMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);

        _refreshTokenRepoMock.Setup(r => r.RevokeAsync(It.IsAny<int>()))
            .ReturnsAsync(true);

        _jwtHelperMock.Setup(h => h.GenerateJwtToken(It.IsAny<User>()))
            .Returns("new-jwt-token");
        _jwtHelperMock.Setup(h => h.GenerateRefreshToken())
            .Returns("new-refresh-token");

        _refreshTokenRepoMock.Setup(r => r.AddAsync(It.IsAny<RefreshToken>()))
            .ReturnsAsync(new RefreshToken());

        _mapperMock.Setup(m => m.Map<UserResponseDto>(It.IsAny<User>()))
            .Returns(new UserResponseDto { Id = 1, Email = "test@test.com" });

        var request = new RefreshTokenRequestDto { RefreshToken = "valid-refresh-token" };

        // Act
        var result = await _authService.RefreshTokenAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().Be("new-jwt-token");
        result.RefreshToken.Should().Be("new-refresh-token");
    }

    [Fact]
    public async Task RefreshTokenAsync_ExpiredToken_ThrowsUnauthorized()
    {
        // Arrange
        var refreshTokenEntity = new RefreshToken
        {
            Id = 1,
            UserId = 1,
            Token = "expired-token",
            ExpiresAt = DateTime.UtcNow.AddDays(-1),
            CreatedAt = DateTime.UtcNow.AddDays(-8)
        };

        _refreshTokenRepoMock.Setup(r => r.GetByTokenAsync("expired-token"))
            .ReturnsAsync(refreshTokenEntity);

        var request = new RefreshTokenRequestDto { RefreshToken = "expired-token" };

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _authService.RefreshTokenAsync(request));
    }

    #endregion

    #region Password Tests

    [Fact]
    public async Task ForgotPasswordAsync_ValidEmail_GeneratesToken()
    {
        // Arrange
        var user = TestDataFactory.CreateTestUser();
        _userRepoMock.Setup(r => r.GetByEmailAsync("test@test.com"))
            .ReturnsAsync(user);

        // Act
        var result = await _authService.ForgotPasswordAsync("test@test.com");

        // Assert
        result.Should().BeTrue();

        // Verificar que se creó un token en la base de datos
        var tokenCount = await _context.PasswordResetTokens.CountAsync();
        tokenCount.Should().Be(1);
    }

    [Fact]
    public async Task ForgotPasswordAsync_InvalidEmail_ReturnsTrue()
    {
        // Arrange
        _userRepoMock.Setup(r => r.GetByEmailAsync("nonexistent@test.com"))
            .ReturnsAsync((User)null!);

        // Act
        var result = await _authService.ForgotPasswordAsync("nonexistent@test.com");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ResetPasswordAsync_ValidToken_ResetsPassword()
    {
        // Arrange
        var user = TestDataFactory.CreateTestUser();
        var resetToken = new PasswordResetToken
        {
            Id = 1,
            UserId = 1,
            Token = "valid-token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            CreatedAt = DateTime.UtcNow
        };

        await _context.PasswordResetTokens.AddAsync(resetToken);
        await _context.SaveChangesAsync();

        _userRepoMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);

        _userRepoMock.Setup(r => r.UpdateAsync(It.IsAny<User>()))
            .Returns(Task.CompletedTask);

        _refreshTokenRepoMock.Setup(r => r.RevokeAllByUserIdAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _authService.ResetPasswordAsync("valid-token", "NewPassword123!");

        // Assert
        result.Should().BeTrue();
        user.PasswordHash.Should().NotBe(PasswordHelper.HashPassword("Test123!"));
    }

    [Fact]
    public async Task ResetPasswordAsync_ExpiredToken_ReturnsFalse()
    {
        // Arrange
        var resetToken = new PasswordResetToken
        {
            Id = 1,
            UserId = 1,
            Token = "expired-token",
            ExpiresAt = DateTime.UtcNow.AddHours(-1),
            CreatedAt = DateTime.UtcNow.AddHours(-2)
        };

        await _context.PasswordResetTokens.AddAsync(resetToken);
        await _context.SaveChangesAsync();

        // Act
        var result = await _authService.ResetPasswordAsync("expired-token", "NewPassword123!");

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region Logout Tests

    [Fact]
    public async Task LogoutAsync_ValidUser_RevokesAllTokens()
    {
        // Arrange
        _refreshTokenRepoMock.Setup(r => r.RevokeAllByUserIdAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _authService.LogoutAsync(1);

        // Assert
        result.Should().BeTrue();
        _refreshTokenRepoMock.Verify(r => r.RevokeAllByUserIdAsync(1), Times.Once);
    }

    #endregion

    public void Dispose()
    {
        _context?.Dispose();
    }
}