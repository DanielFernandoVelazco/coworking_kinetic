using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Implementations;
using Microsoft.EntityFrameworkCore;

namespace KineticWorkspace.API.Tests.UnitTests.Repositories;

public class UserRepositoryTests
{
    private readonly ApplicationDbContext _context;
    private readonly UserRepository _repository;

    public UserRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _repository = new UserRepository(_context);
    }

    #region Get By Email Tests

    [Fact]
    public async Task GetByEmailAsync_ExistingEmail_ReturnsUser()
    {
        // Arrange
        var user = TestDataFactory.CreateTestUser(1, "test@test.com");
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByEmailAsync("test@test.com");

        // Assert
        result.Should().NotBeNull();
        result!.Email.Should().Be("test@test.com");
    }

    [Fact]
    public async Task GetByEmailAsync_NonExistingEmail_ReturnsNull()
    {
        // Act
        var result = await _repository.GetByEmailAsync("nonexistent@test.com");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByEmailAsync_CaseInsensitive_ReturnsUser()
    {
        // Arrange
        var user = TestDataFactory.CreateTestUser(1, "Test@Test.com");
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByEmailAsync("test@test.com");

        // Assert
        result.Should().NotBeNull();
        result!.Email.Should().Be("Test@Test.com");
    }

    #endregion

    #region Get User With Reservations Tests

    [Fact]
    public async Task GetUserWithReservationsAsync_ExistingUser_ReturnsUserWithReservations()
    {
        // Arrange
        var user = TestDataFactory.CreateTestUser(1, "test@test.com");
        var reservation = TestDataFactory.CreateTestReservation(1, 1, 1, "Confirmed");

        await _context.Users.AddAsync(user);
        await _context.Reservations.AddAsync(reservation);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetUserWithReservationsAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Reservations.Should().NotBeEmpty();
        result.Reservations.First().Id.Should().Be(1);
    }

    [Fact]
    public async Task GetUserWithReservationsAsync_NonExistingUser_ReturnsNull()
    {
        // Act
        var result = await _repository.GetUserWithReservationsAsync(999);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region Get Active Users Tests

    [Fact]
    public async Task GetActiveUsersAsync_ReturnsOnlyActiveUsers()
    {
        // Arrange
        var activeUser = TestDataFactory.CreateTestUser(1, "active@test.com");
        activeUser.IsActive = true;

        var inactiveUser = TestDataFactory.CreateTestUser(2, "inactive@test.com");
        inactiveUser.IsActive = false;

        await _context.Users.AddRangeAsync(activeUser, inactiveUser);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetActiveUsersAsync();

        // Assert
        result.Should().HaveCount(1);
        result.First().Email.Should().Be("active@test.com");
    }

    #endregion

    #region Update Last Login Tests

    [Fact]
    public async Task UpdateLastLoginAsync_ExistingUser_ReturnsTrue()
    {
        // Arrange
        var user = TestDataFactory.CreateTestUser(1, "test@test.com");
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.UpdateLastLoginAsync(1);

        // Assert
        result.Should().BeTrue();
        var updatedUser = await _context.Users.FindAsync(1);
        updatedUser!.LastLoginAt.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateLastLoginAsync_NonExistingUser_ReturnsFalse()
    {
        // Act
        var result = await _repository.UpdateLastLoginAsync(999);

        // Assert
        result.Should().BeFalse();
    }

    #endregion
}