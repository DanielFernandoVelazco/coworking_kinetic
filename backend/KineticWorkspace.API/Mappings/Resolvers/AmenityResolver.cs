using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Mappings.Resolvers
{
    public static class AmenityResolver
    {
        /// <summary>
        /// Extrae los nombres de amenidades de una colección. Devuelve lista vacía si es null.
        /// </summary>
        public static List<string> GetNames(ICollection<Amenity>? amenities)
        {
            if (amenities == null || !amenities.Any())
                return new List<string>();

            return amenities.Select(a => a.Name).ToList();
        }

        /// <summary>
        /// Extrae los IDs de amenidades de una colección. Devuelve lista vacía si es null.
        /// </summary>
        public static List<int> GetIds(ICollection<Amenity>? amenities)
        {
            if (amenities == null || !amenities.Any())
                return new List<int>();

            return amenities.Select(a => a.Id).ToList();
        }
    }
}