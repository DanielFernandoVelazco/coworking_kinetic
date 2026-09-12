namespace KineticWorkspace.API.Data.SeedData.SeedCatalogs
{
    public static class ImageUrlCatalog
    {
        /// <summary>
        /// URLs de imágenes por tipo de espacio.
        /// </summary>
        public static readonly Dictionary<string, List<string>> BySpaceType = new()
        {
            ["Premium Office"] = new()
            {
                "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
                "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
                "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800"
            },
            ["Meeting Room"] = new()
            {
                "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
                "https://images.unsplash.com/photo-1597755602304-554bdc3c2688?w=800",
                "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800"
            },
            ["Dedicated Desk"] = new()
            {
                "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800",
                "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
                "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800"
            },
            ["Focus Pod"] = new()
            {
                "https://images.unsplash.com/photo-1534073737924-14d5cf6abc7f?w=800",
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
                "https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=800"
            },
            ["Creative Space"] = new()
            {
                "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
                "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800",
                "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800"
            }
        };
    }
}