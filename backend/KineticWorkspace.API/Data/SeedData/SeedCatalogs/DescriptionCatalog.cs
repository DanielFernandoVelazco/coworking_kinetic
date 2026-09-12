namespace KineticWorkspace.API.Data.SeedData.SeedCatalogs
{
    public static class DescriptionCatalog
    {
        /// <summary>
        /// Plantillas de descripción por tipo de espacio.
        /// </summary>
        public static readonly Dictionary<string, List<string>> BySpaceType = new()
        {
            ["Premium Office"] = new()
            {
                "A premium office space designed for productivity and comfort. Perfect for teams of up to {capacity} people.",
                "Executive office with modern amenities and stunning views. Accommodates {capacity} professionals comfortably.",
                "High-end workspace in the heart of the city. Ideal for {capacity} team members with all necessary equipment."
            },
            ["Meeting Room"] = new()
            {
                "Professional meeting room with state-of-the-art technology. Comfortably seats up to {capacity} participants.",
                "Fully equipped meeting room perfect for presentations and collaborative sessions. Capacity: {capacity} people.",
                "Modern meeting space with video conferencing capabilities. Suitable for groups of {capacity}."
            },
            ["Dedicated Desk"] = new()
            {
                "Your personal workspace in a vibrant community. Ergonomic setup for focused work.",
                "Dedicated desk with all the essentials for productive days. Join our professional community.",
                "A permanent workspace where you can leave your equipment. Perfect for remote professionals."
            },
            ["Focus Pod"] = new()
            {
                "A quiet, private space designed for deep focus and concentration. Soundproofed for maximum productivity.",
                "Private pod for distraction-free work. Ideal for calls, writing, and focused tasks.",
                "Your personal retreat in a professional setting. Perfect for focused work sessions."
            },
            ["Creative Space"] = new()
            {
                "An inspiring, open environment designed to foster creativity and collaboration. Features a unique atmosphere.",
                "A dynamic space where ideas come to life. Perfect for creative professionals and teams.",
                "A versatile space for brainstorming, workshops, and creative projects."
            }
        };
    }
}