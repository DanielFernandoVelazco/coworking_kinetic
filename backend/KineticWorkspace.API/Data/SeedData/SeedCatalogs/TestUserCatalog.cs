namespace KineticWorkspace.API.Data.SeedData.SeedCatalogs
{
    /// <summary>
    /// Datos fijos del usuario de prueba (test@kineticworkspace.com).
    /// </summary>
    public static class TestUserCatalog
    {
        public const string Email = "test@kineticworkspace.com";
        public const string Password = "Test123!";
        public const string FirstName = "Test";
        public const string LastName = "User";
        public const string PhoneNumber = "+46 70 987 6543";
        public const string Company = "Kinetic Test Company";
        public const string JobTitle = "Software Engineer";
        public const string ProfileImageUrl =
            "https://ui-avatars.com/api/?name=Test+User&size=128&background=a03f28&color=fff&font-size=0.5";

        public const int ReservationsToSeed = 15;
    }
}