using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Tests.Fixtures;

public class TestDataFixture
{
    public User TestUser => TestDataFactory.CreateTestUser();
    public Space TestSpace => TestDataFactory.CreateTestSpace();
    public Reservation TestReservation => TestDataFactory.CreateTestReservation();
    public Alert TestAlert => TestDataFactory.CreateTestAlert();
    public Amenity TestAmenity => TestDataFactory.CreateTestAmenity();
    public PreReservation TestPreReservation => TestDataFactory.CreateTestPreReservation();
}