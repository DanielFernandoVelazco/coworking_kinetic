using AutoMapper;

namespace KineticWorkspace.API.Mappings.Resolvers
{
    public class CsvStringToListResolver : IValueResolver<object, object, List<string>>
    {
        public List<string> Resolve(object source, object destination, List<string> destMember, ResolutionContext context)
        {
            // Este resolver solo se usa como plantilla; no se ejecuta directamente.
            return new List<string>();
        }
    }
}