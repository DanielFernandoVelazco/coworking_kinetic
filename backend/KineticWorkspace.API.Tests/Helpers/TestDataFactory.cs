using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Tests.Helpers;

public static class TestDataFactory
{
    public static User CreateTestUser(int id = 1, string email = "test@test.com", bool isAdmin = false)
    {
        return new User
        {
            Id = id,
            FirstName = "Test",
            LastName = "User",
            Email = email,
            PasswordHash = PasswordHelper.HashPassword("Test123!"),
            PhoneNumber = "+46 70 123 4567",
            Company = "Test Company",
            JobTitle = "Software Engineer",
            IsActive = true,
            IsAdmin = isAdmin,
            CreatedAt = DateTime.UtcNow.AddDays(-30)
        };
    }

    public static Space CreateTestSpace(int id = 1, string name = "Test Space", string type = "Premium Office")
    {
        return new Space
        {
            Id = id,
            Name = name,
            Description = "Test description",
            Type = type,
            Capacity = 10,
            PricePerHour = 50m,
            PricePerDay = 300m,
            Address = "Test Street 123",
            City = "Stockholm",
            District = "Test District",
            PostalCode = "114 36",
            Country = "Sweden",
            IsAvailable = true,
            IsFeatured = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };
    }

    public static Reservation CreateTestReservation(int id = 1, int userId = 1, int spaceId = 1, string status = "Confirmed")
    {
        var now = DateTime.UtcNow;
        return new Reservation
        {
            Id = id,
            UserId = userId,
            SpaceId = spaceId,
            StartTime = now.AddHours(2),
            EndTime = now.AddHours(4),
            Status = status,
            TotalPrice = 100m,
            NumberOfGuests = 2,
            CreatedAt = now.AddDays(-1),
            UpdatedAt = now
        };
    }

    public static Alert CreateTestAlert(int id = 1, int userId = 1, string type = "info")
    {
        return new Alert
        {
            Id = id,
            UserId = userId,
            Title = "Test Alert",
            Message = "This is a test alert message",
            Type = type,
            Category = "general",
            IsRead = false,
            CreatedAt = DateTime.UtcNow.AddHours(-1)
        };
    }

    public static Amenity CreateTestAmenity(int id = 1, string name = "WiFi")
    {
        return new Amenity
        {
            Id = id,
            Name = name,
            Description = "High-speed WiFi",
            Icon = "wifi",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        };
    }

    public static PreReservation CreateTestPreReservation(int id = 1, int userId = 1, int spaceId = 1, string status = "Pending")
    {
        var now = DateTime.UtcNow;
        return new PreReservation
        {
            Id = id,
            UserId = userId,
            SpaceId = spaceId,
            StartTime = now.AddHours(2),
            EndTime = now.AddHours(4),
            Status = status,
            TotalPrice = 100m,
            NumberOfGuests = 2,
            SessionId = $"test_session_{Guid.NewGuid()}",
            CreatedAt = now,
            ExpiresAt = now.AddMinutes(30)
        };
    }
}