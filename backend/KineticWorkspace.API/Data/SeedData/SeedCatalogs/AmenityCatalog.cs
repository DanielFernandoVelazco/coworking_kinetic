namespace KineticWorkspace.API.Data.SeedData.SeedCatalogs
{
    public static class AmenityCatalog
    {
        /// <summary>
        /// Amenidades agrupadas por tipo de espacio.
        /// </summary>
        public static readonly Dictionary<string, List<string>> BySpaceType = new()
        {
            ["Premium Office"] = new()
            {
                "High-speed WiFi", "Ergonomic Chairs", "Standing Desks",
                "Meeting Rooms", "Private Kitchen", "24/7 Access",
                "Security System", "Cleaning Service", "Coffee Bar", "Printing Service"
            },
            ["Meeting Room"] = new()
            {
                "High-speed WiFi", "Video Conference", "Whiteboard",
                "Projector", "Smart TV", "Conference Phone",
                "HDMI Connectivity", "Sound System", "Coffee Service", "Natural Light"
            },
            ["Dedicated Desk"] = new()
            {
                "High-speed WiFi", "Ergonomic Chair", "Standing Desk",
                "Storage Lockers", "Access to Kitchen", "Community Events",
                "24/7 Access", "Printing Service", "Phone Booths", "Coffee Bar"
            },
            ["Focus Pod"] = new()
            {
                "High-speed WiFi", "Soundproofing", "Ergonomic Chair",
                "Desk Lamp", "Power Outlets", "Privacy Glass",
                "Air Purifier", "Plant Decor", "Minimalist Design", "Smart Lighting"
            },
            ["Creative Space"] = new()
            {
                "High-speed WiFi", "Creative Equipment", "Open Floor Plan",
                "Art Supplies", "Standing Desks", "Community Board",
                "Natural Light", "Collaboration Tools", "Whiteboard Walls", "Coffee Bar"
            }
        };
    }
}