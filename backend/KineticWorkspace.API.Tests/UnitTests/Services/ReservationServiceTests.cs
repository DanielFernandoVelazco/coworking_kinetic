using AutoMapper;
using KineticWorkspace.API.Mappings;
using KineticWorkspace.API.Models.DTOs.Reservations;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Repositories.Interfaces;
using KineticWorkspace.API.Services.Implementations;
using Moq;

namespace KineticWorkspace.API.Tests.UnitTests.Services;

public class ReservationServiceTests
{
    private readonly Mock<IReservationRepository> _reservationRepoMock;
    private readonly Mock<ISpaceRepository> _spaceRepoMock;
    private readonly IMapper _mapper;
    private readonly Mock<ILogger<ReservationService>> _loggerMock;
    private readonly ReservationService _reservationService;

    public ReservationServiceTests()
    {
        _reservationRepoMock = new Mock<IReservationRepository>();
        _spaceRepoMock = new Mock<ISpaceRepository>();
        _loggerMock = new Mock<ILogger<ReservationService>>();

        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();

        _reservationService = new ReservationService(
            _reservationRepoMock.Object,
            _spaceRepoMock.Object,
            _mapper,
            _loggerMock.Object
        );
    }

    #region Create Reservation Tests

    [Fact]
    public async Task CreateReservationAsync_ValidData_ReturnsReservation()
    {
        // Arrange
        var space = TestDataFactory.CreateTestSpace(1, "Test Space", "Premium Office");
        var request = new ReservationRequestDto
        {
            SpaceId = 1,
            StartTime = DateTime.UtcNow.AddHours(2),
            EndTime = DateTime.UtcNow.AddHours(4),
            NumberOfGuests = 2,
            Notes = "Test notes"
        };

        _spaceRepoMock.Setup(r => r.IsSpaceAvailableAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>(), null))
            .ReturnsAsync(true);

        _spaceRepoMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(space);

        _reservationRepoMock.Setup(r => r.AddAsync(It.IsAny<Reservation>()))
            .ReturnsAsync((Reservation r) => r);

        // Act
        var result = await _reservationService.CreateReservationAsync(request, 1);

        // Assert
        result.Should().NotBeNull();
        result.SpaceId.Should().Be(1);
        result.UserId.Should().Be(1);
        result.TotalPrice.Should().BeGreaterThan(0);
        result.Status.Should().Be("Pending");
    }

    [Fact]
    public async Task CreateReservationAsync_UnavailableSpace_ThrowsException()
    {
        // Arrange
        var request = new ReservationRequestDto
        {
            SpaceId = 1,
            StartTime = DateTime.UtcNow.AddHours(2),
            EndTime = DateTime.UtcNow.AddHours(4)
        };

        _spaceRepoMock.Setup(r => r.IsSpaceAvailableAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>(), null))
            .ReturnsAsync(false);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _reservationService.CreateReservationAsync(request, 1));
    }

    [Fact]
    public async Task CreateReservationAsync_ExceedsCapacity_ThrowsException()
    {
        // Arrange
        var space = TestDataFactory.CreateTestSpace(1, "Test Space", "Premium Office");
        space.Capacity = 5;

        var request = new ReservationRequestDto
        {
            SpaceId = 1,
            StartTime = DateTime.UtcNow.AddHours(2),
            EndTime = DateTime.UtcNow.AddHours(4),
            NumberOfGuests = 10
        };

        _spaceRepoMock.Setup(r => r.IsSpaceAvailableAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>(), null))
            .ReturnsAsync(true);

        _spaceRepoMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(space);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _reservationService.CreateReservationAsync(request, 1));
        exception.Message.Should().Contain("capacidad máxima");
    }

    [Fact]
    public async Task CreateReservationAsync_StartTimeInPast_ThrowsException()
    {
        // Arrange
        var request = new ReservationRequestDto
        {
            SpaceId = 1,
            StartTime = DateTime.UtcNow.AddHours(-2),
            EndTime = DateTime.UtcNow.AddHours(2)
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _reservationService.CreateReservationAsync(request, 1));
    }

    [Fact]
    public async Task CreateReservationAsync_StartTimeAfterEndTime_ThrowsException()
    {
        // Arrange
        var request = new ReservationRequestDto
        {
            SpaceId = 1,
            StartTime = DateTime.UtcNow.AddHours(4),
            EndTime = DateTime.UtcNow.AddHours(2)
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _reservationService.CreateReservationAsync(request, 1));
    }

    #endregion

    #region Get User Reservations Tests

    [Fact]
    public async Task GetUserReservationsAsync_WithReservations_ReturnsList()
    {
        // Arrange
        var reservations = new List<Reservation>
        {
            TestDataFactory.CreateTestReservation(1, 1, 1, "Confirmed"),
            TestDataFactory.CreateTestReservation(2, 1, 2, "Pending")
        };

        _reservationRepoMock.Setup(r => r.GetUserReservationsAsync(1))
            .ReturnsAsync(reservations);

        // Act
        var result = await _reservationService.GetUserReservationsAsync(1);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetUserReservationsAsync_NoReservations_ReturnsEmptyList()
    {
        // Arrange
        _reservationRepoMock.Setup(r => r.GetUserReservationsAsync(1))
            .ReturnsAsync(new List<Reservation>());

        // Act
        var result = await _reservationService.GetUserReservationsAsync(1);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    #endregion

    #region Get Reservation By Id Tests

    [Fact]
    public async Task GetReservationByIdAsync_ExistingId_ReturnsReservation()
    {
        // Arrange
        var reservation = TestDataFactory.CreateTestReservation(1, 1, 1, "Confirmed");
        _reservationRepoMock.Setup(r => r.GetReservationWithDetailsAsync(1))
            .ReturnsAsync(reservation);

        // Act
        var result = await _reservationService.GetReservationByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.Status.Should().Be("Confirmed");
    }

    [Fact]
    public async Task GetReservationByIdAsync_NonExistingId_ReturnsNull()
    {
        // Arrange
        _reservationRepoMock.Setup(r => r.GetReservationWithDetailsAsync(999))
            .ReturnsAsync((Reservation)null!);

        // Act
        var result = await _reservationService.GetReservationByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region Update Reservation Tests

    [Fact]
    public async Task UpdateReservationAsync_AsOwner_ReturnsUpdated()
    {
        // Arrange
        var reservation = TestDataFactory.CreateTestReservation(1, 1, 1, "Confirmed");
        var space = TestDataFactory.CreateTestSpace(2, "New Space", "Meeting Room");

        _reservationRepoMock.Setup(r => r.GetReservationWithDetailsAsync(1))
            .ReturnsAsync(reservation);

        _spaceRepoMock.Setup(r => r.IsSpaceAvailableAsync(2, It.IsAny<DateTime>(), It.IsAny<DateTime>(), 1))
            .ReturnsAsync(true);

        _spaceRepoMock.Setup(r => r.GetByIdAsync(2))
            .ReturnsAsync(space);

        _reservationRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Reservation>()))
            .Returns(Task.CompletedTask);

        var request = new ReservationRequestDto
        {
            SpaceId = 2,
            StartTime = DateTime.UtcNow.AddHours(3),
            EndTime = DateTime.UtcNow.AddHours(5),
            NumberOfGuests = 3
        };

        // Act
        var result = await _reservationService.UpdateReservationAsync(1, request, 1, false);

        // Assert
        result.Should().NotBeNull();
        result!.SpaceId.Should().Be(2);
        result.NumberOfGuests.Should().Be(3);
    }

    [Fact]
    public async Task UpdateReservationAsync_NotOwner_ThrowsUnauthorized()
    {
        // Arrange
        var reservation = TestDataFactory.CreateTestReservation(1, 1, 1, "Confirmed");
        _reservationRepoMock.Setup(r => r.GetReservationWithDetailsAsync(1))
            .ReturnsAsync(reservation);

        var request = new ReservationRequestDto
        {
            SpaceId = 1,
            StartTime = DateTime.UtcNow.AddHours(2),
            EndTime = DateTime.UtcNow.AddHours(4)
        };

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _reservationService.UpdateReservationAsync(1, request, 2, false));
    }

    [Fact]
    public async Task UpdateReservationAsync_CancelledReservation_ThrowsException()
    {
        // Arrange
        var reservation = TestDataFactory.CreateTestReservation(1, 1, 1, "Cancelled");
        _reservationRepoMock.Setup(r => r.GetReservationWithDetailsAsync(1))
            .ReturnsAsync(reservation);

        var request = new ReservationRequestDto
        {
            SpaceId = 1,
            StartTime = DateTime.UtcNow.AddHours(2),
            EndTime = DateTime.UtcNow.AddHours(4)
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _reservationService.UpdateReservationAsync(1, request, 1, false));
    }

    #endregion

    #region Cancel Reservation Tests

    [Fact]
    public async Task CancelReservationAsync_AsOwner_ReturnsTrue()
    {
        // Arrange
        var reservation = TestDataFactory.CreateTestReservation(1, 1, 1, "Confirmed");
        _reservationRepoMock.Setup(r => r.GetReservationWithDetailsAsync(1))
            .ReturnsAsync(reservation);

        _reservationRepoMock.Setup(r => r.CancelReservationAsync(1, "Test reason"))
            .ReturnsAsync(true);

        // Act
        var result = await _reservationService.CancelReservationAsync(1, 1, "Test reason", false);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CancelReservationAsync_NotOwner_ThrowsUnauthorized()
    {
        // Arrange
        var reservation = TestDataFactory.CreateTestReservation(1, 1, 1, "Confirmed");
        _reservationRepoMock.Setup(r => r.GetReservationWithDetailsAsync(1))
            .ReturnsAsync(reservation);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _reservationService.CancelReservationAsync(1, 2, "Test", false));
    }

    [Fact]
    public async Task CancelReservationAsync_CompletedReservation_ThrowsException()
    {
        // Arrange
        var reservation = TestDataFactory.CreateTestReservation(1, 1, 1, "Completed");
        _reservationRepoMock.Setup(r => r.GetReservationWithDetailsAsync(1))
            .ReturnsAsync(reservation);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _reservationService.CancelReservationAsync(1, 1, "Test", false));
    }

    #endregion

    #region Confirm Reservation Tests (Admin)

    [Fact]
    public async Task ConfirmReservationAsync_AsAdmin_ReturnsTrue()
    {
        // Arrange
        var reservation = TestDataFactory.CreateTestReservation(1, 1, 1, "Pending");
        _reservationRepoMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(reservation);

        _reservationRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Reservation>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _reservationService.ConfirmReservationAsync(1, 999);

        // Assert
        result.Should().BeTrue();
        reservation.Status.Should().Be("Confirmed");
    }

    [Fact]
    public async Task ConfirmReservationAsync_NotPending_ThrowsException()
    {
        // Arrange
        var reservation = TestDataFactory.CreateTestReservation(1, 1, 1, "Confirmed");
        _reservationRepoMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(reservation);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _reservationService.ConfirmReservationAsync(1, 999));
    }

    #endregion

    #region Get Upcoming Reservations Tests

    [Fact]
    public async Task GetUpcomingReservationsAsync_ReturnsUpcoming()
    {
        // Arrange
        var reservations = new List<Reservation>
        {
            TestDataFactory.CreateTestReservation(1, 1, 1, "Confirmed"),
            TestDataFactory.CreateTestReservation(2, 1, 2, "Confirmed")
        };

        _reservationRepoMock.Setup(r => r.GetUpcomingReservationsAsync(1, 5))
            .ReturnsAsync(reservations);

        // Act
        var result = await _reservationService.GetUpcomingReservationsAsync(1, 5);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    #endregion

    #region Get Reservation Summary Tests

    [Fact]
    public async Task GetReservationSummaryAsync_ReturnsSummary()
    {
        // Arrange
        var reservations = new List<Reservation>
        {
            TestDataFactory.CreateTestReservation(1, 1, 1, "Confirmed"),
            TestDataFactory.CreateTestReservation(2, 1, 2, "Completed"),
            TestDataFactory.CreateTestReservation(3, 1, 3, "Cancelled")
        };

        _reservationRepoMock.Setup(r => r.GetUserReservationsAsync(1))
            .ReturnsAsync(reservations);

        // Act
        var result = await _reservationService.GetReservationSummaryAsync(1);

        // Assert
        result.Should().NotBeNull();
        result.TotalReservations.Should().Be(3);
        result.CompletedReservations.Should().Be(1);
        result.CancelledReservations.Should().Be(1);
    }

    #endregion
}