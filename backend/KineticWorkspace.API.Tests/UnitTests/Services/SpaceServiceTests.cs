using AutoMapper;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.DTOs.Spaces;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Implementations;
using KineticWorkspace.API.Mappings;
using Moq;

namespace KineticWorkspace.API.Tests.UnitTests.Services;

public class SpaceServiceTests
{
    private readonly Mock<ISpaceRepository> _spaceRepoMock;
    private readonly Mock<ILogger<SpaceService>> _loggerMock;
    private readonly IMapper _mapper;
    private readonly ApplicationDbContext _context;
    private readonly SpaceService _spaceService;

    public SpaceServiceTests()
    {
        _spaceRepoMock = new Mock<ISpaceRepository>();
        _loggerMock = new Mock<ILogger<SpaceService>>();

        // Configurar AutoMapper
        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);

        _spaceService = new SpaceService(
            _spaceRepoMock.Object,
            _mapper,
            _loggerMock.Object,
            _context
        );
    }

    #region Get All Spaces Tests

    [Fact]
    public async Task GetAllSpacesAsync_WithPagination_ReturnsPagedSpaces()
    {
        // Arrange
        var spaces = new List<Space>
        {
            TestDataFactory.CreateTestSpace(1, "Space 1"),
            TestDataFactory.CreateTestSpace(2, "Space 2"),
            TestDataFactory.CreateTestSpace(3, "Space 3"),
            TestDataFactory.CreateTestSpace(4, "Space 4"),
            TestDataFactory.CreateTestSpace(5, "Space 5")
        };

        _spaceRepoMock.Setup(r => r.GetPagedAsync(1, 3, null))
            .ReturnsAsync(spaces.Take(3));

        // Act
        var result = await _spaceService.GetAllSpacesAsync(1, 3);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(3);
        result.First().Name.Should().Be("Space 1");
    }

    [Fact]
    public async Task GetAllSpacesAsync_EmptyList_ReturnsEmptyList()
    {
        // Arrange
        _spaceRepoMock.Setup(r => r.GetPagedAsync(1, 10, null))
            .ReturnsAsync(new List<Space>());

        // Act
        var result = await _spaceService.GetAllSpacesAsync(1, 10);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllSpacesUnpaginatedAsync_ReturnsAllSpaces()
    {
        // Arrange
        var spaces = new List<Space>
        {
            TestDataFactory.CreateTestSpace(1, "Space 1"),
            TestDataFactory.CreateTestSpace(2, "Space 2")
        };

        _spaceRepoMock.Setup(r => r.GetAllAsync())
            .ReturnsAsync(spaces);

        // Act
        var result = await _spaceService.GetAllSpacesUnpaginatedAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    #endregion

    #region Get Space By Id Tests

    [Fact]
    public async Task GetSpaceByIdAsync_ExistingId_ReturnsSpace()
    {
        // Arrange
        var space = TestDataFactory.CreateTestSpace(1, "Test Space");
        _spaceRepoMock.Setup(r => r.GetSpaceWithDetailsAsync(1))
            .ReturnsAsync(space);

        // Act
        var result = await _spaceService.GetSpaceByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Test Space");
        result.Id.Should().Be(1);
    }

    [Fact]
    public async Task GetSpaceByIdAsync_NonExistingId_ReturnsNull()
    {
        // Arrange
        _spaceRepoMock.Setup(r => r.GetSpaceWithDetailsAsync(999))
            .ReturnsAsync((Space)null!);

        // Act
        var result = await _spaceService.GetSpaceByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region Create Space Tests

    [Fact]
    public async Task CreateSpaceAsync_ValidData_ReturnsCreatedSpace()
    {
        // Arrange
        var request = new SpaceRequestDto
        {
            Name = "New Space",
            Description = "New description",
            Type = "Premium Office",
            Capacity = 15,
            PricePerHour = 75m,
            PricePerDay = 450m,
            Address = "New Street 123",
            City = "Stockholm",
            District = "New District",
            Country = "Sweden",
            IsAvailable = true,
            IsFeatured = false
        };

        _spaceRepoMock.Setup(r => r.AddAsync(It.IsAny<Space>()))
            .ReturnsAsync((Space s) => s);

        // Act
        var result = await _spaceService.CreateSpaceAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("New Space");
        result.City.Should().Be("Stockholm");
        result.PricePerHour.Should().Be(75m);
    }

    [Fact]
    public async Task CreateSpaceAsync_WithAmenities_AddsAmenities()
    {
        // Arrange
        var amenity = TestDataFactory.CreateTestAmenity(1, "WiFi");
        await _context.Amenities.AddAsync(amenity);
        await _context.SaveChangesAsync();

        var request = new SpaceRequestDto
        {
            Name = "Space with Amenities",
            Description = "Test",
            Type = "Premium Office",
            Capacity = 10,
            PricePerHour = 50m,
            Address = "Test Address",
            City = "Stockholm",
            District = "Test",
            Country = "Sweden",
            AmenityIds = new List<int> { 1 }
        };

        _spaceRepoMock.Setup(r => r.AddAsync(It.IsAny<Space>()))
            .ReturnsAsync((Space s) => s);

        // Act
        var result = await _spaceService.CreateSpaceAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Amenities.Should().Contain("WiFi");
    }

    #endregion

    #region Update Space Tests

    [Fact]
    public async Task UpdateSpaceAsync_ExistingId_ReturnsUpdatedSpace()
    {
        // Arrange
        var existingSpace = TestDataFactory.CreateTestSpace(1, "Old Name");

        _spaceRepoMock.Setup(r => r.GetSpaceWithDetailsAsync(1))
            .ReturnsAsync(existingSpace);

        _spaceRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Space>()))
            .Returns(Task.CompletedTask);

        var request = new SpaceRequestDto
        {
            Name = "Updated Name",
            Description = "Updated description",
            Type = "Meeting Room",
            Capacity = 20,
            PricePerHour = 100m,
            Address = "Updated Address",
            City = "Gothenburg",
            District = "Updated",
            Country = "Sweden"
        };

        // Act
        var result = await _spaceService.UpdateSpaceAsync(1, request);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Updated Name");
        result.Type.Should().Be("Meeting Room");
        result.City.Should().Be("Gothenburg");
    }

    [Fact]
    public async Task UpdateSpaceAsync_NonExistingId_ReturnsNull()
    {
        // Arrange
        _spaceRepoMock.Setup(r => r.GetSpaceWithDetailsAsync(999))
            .ReturnsAsync((Space)null!);

        var request = new SpaceRequestDto
        {
            Name = "Updated Name",
            Description = "Test",
            Type = "Test",
            Capacity = 10,
            PricePerHour = 50m,
            Address = "Test",
            City = "Test",
            District = "Test",
            Country = "Sweden"
        };

        // Act
        var result = await _spaceService.UpdateSpaceAsync(999, request);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region Delete Space Tests

    [Fact]
    public async Task DeleteSpaceAsync_ExistingId_ReturnsTrue()
    {
        // Arrange
        var space = TestDataFactory.CreateTestSpace(1);
        _spaceRepoMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(space);
        _spaceRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Space>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _spaceService.DeleteSpaceAsync(1);

        // Assert
        result.Should().BeTrue();
        space.IsActive.Should().BeFalse();
        space.DeletedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task DeleteSpaceAsync_NonExistingId_ReturnsFalse()
    {
        // Arrange
        _spaceRepoMock.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Space)null!);

        // Act
        var result = await _spaceService.DeleteSpaceAsync(999);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region Featured Spaces Tests

    [Fact]
    public async Task GetFeaturedSpacesAsync_ReturnsFeaturedSpaces()
    {
        // Arrange
        var spaces = new List<Space>
        {
            TestDataFactory.CreateTestSpace(1, "Featured 1"),
            TestDataFactory.CreateTestSpace(2, "Featured 2")
        };

        _spaceRepoMock.Setup(r => r.GetFeaturedSpacesAsync(5))
            .ReturnsAsync(spaces);

        // Act
        var result = await _spaceService.GetFeaturedSpacesAsync(5);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    #endregion

    #region Search Spaces Tests

    [Fact]
    public async Task SearchSpacesAsync_WithTerm_ReturnsMatchingSpaces()
    {
        // Arrange
        var spaces = new List<Space>
        {
            TestDataFactory.CreateTestSpace(1, "Premium Office Stockholm"),
            TestDataFactory.CreateTestSpace(2, "Meeting Room Gothenburg")
        };

        _spaceRepoMock.Setup(r => r.SearchSpacesAsync("Stockholm", null, null))
            .ReturnsAsync(spaces.Where(s => s.City == "Stockholm"));

        // Act
        var result = await _spaceService.SearchSpacesAsync("Stockholm");

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result.First().City.Should().Be("Stockholm");
    }

    [Fact]
    public async Task SearchSpacesAsync_WithTypeFilter_ReturnsFilteredSpaces()
    {
        // Arrange
        var spaces = new List<Space>
        {
            TestDataFactory.CreateTestSpace(1, "Office", "Premium Office"),
            TestDataFactory.CreateTestSpace(2, "Meeting Room", "Meeting Room")
        };

        _spaceRepoMock.Setup(r => r.SearchSpacesAsync("", null, "Premium Office"))
            .ReturnsAsync(spaces.Where(s => s.Type == "Premium Office"));

        // Act
        var result = await _spaceService.SearchSpacesAsync("", null, "Premium Office");

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result.First().Type.Should().Be("Premium Office");
    }

    #endregion

    #region Availability Tests

    [Fact]
    public async Task CheckAvailabilityAsync_Available_ReturnsTrue()
    {
        // Arrange
        _spaceRepoMock.Setup(r => r.IsSpaceAvailableAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>(), null))
            .ReturnsAsync(true);

        var startTime = DateTime.UtcNow.AddHours(2);
        var endTime = DateTime.UtcNow.AddHours(4);

        // Act
        var result = await _spaceService.CheckAvailabilityAsync(1, startTime, endTime);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CheckAvailabilityAsync_NotAvailable_ReturnsFalse()
    {
        // Arrange
        _spaceRepoMock.Setup(r => r.IsSpaceAvailableAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>(), null))
            .ReturnsAsync(false);

        var startTime = DateTime.UtcNow.AddHours(2);
        var endTime = DateTime.UtcNow.AddHours(4);

        // Act
        var result = await _spaceService.CheckAvailabilityAsync(1, startTime, endTime);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region Available Spaces Tests

    [Fact]
    public async Task GetAvailableSpacesAsync_ReturnsAvailableSpaces()
    {
        // Arrange
        var spaces = new List<Space>
        {
            TestDataFactory.CreateTestSpace(1, "Available 1"),
            TestDataFactory.CreateTestSpace(2, "Available 2")
        };

        var startTime = DateTime.UtcNow.AddHours(2);
        var endTime = DateTime.UtcNow.AddHours(4);

        _spaceRepoMock.Setup(r => r.GetAvailableSpacesAsync(startTime, endTime))
            .ReturnsAsync(spaces);

        // Act
        var result = await _spaceService.GetAvailableSpacesAsync(startTime, endTime, 1, 10);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    #endregion
}