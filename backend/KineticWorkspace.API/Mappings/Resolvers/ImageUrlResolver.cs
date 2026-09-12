namespace KineticWorkspace.API.Mappings.Resolvers
{
    public static class ImageUrlResolver
    {
        /// <summary>
        /// Convierte un string CSV ("url1,url2,url3") en List&lt;string&gt;.
        /// Devuelve lista vacía si es null o vacío.
        /// </summary>
        public static List<string> SplitToList(string? csv)
        {
            if (string.IsNullOrWhiteSpace(csv))
                return new List<string>();

            return csv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();
        }

        /// <summary>
        /// Extrae la primera URL del CSV. Devuelve null si no hay URLs.
        /// </summary>
        public static string? GetFirst(string? csv)
        {
            if (string.IsNullOrWhiteSpace(csv))
                return null;

            return csv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .FirstOrDefault();
        }
    }
}