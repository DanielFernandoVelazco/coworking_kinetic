namespace KineticWorkspace.API.Data.SeedData.SeedCatalogs
{
    public static class LocationCatalog
    {
        public static readonly List<string> Cities = new()
        {
            "Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås",
            "Örebro", "Linköping", "Helsingborg", "Jönköping", "Norrköping"
        };

        public static readonly List<string> Districts = new()
        {
            "Östermalm", "Vasastan", "Södermalm", "Kungsholmen", "Norrmalm",
            "Linnéstaden", "Haga", "Johanneberg", "Mölndal", "Centrum"
        };

        public static readonly List<string> Streets = new()
        {
            "Sveavägen", "Kungsgatan", "Drottninggatan", "Hamngatan", "Birger Jarlsgatan",
            "Avenyn", "Kungsportsavenyn", "Vasaplatsen", "Götaplatsen", "Södra Vägen",
            "Stortorget", "Gustav Adolfs Torg", "Lilla Torg", "Triangeln", "Möllevångstorget"
        };
    }
}