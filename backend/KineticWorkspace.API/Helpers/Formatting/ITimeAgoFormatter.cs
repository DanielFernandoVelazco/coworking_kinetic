namespace KineticWorkspace.API.Helpers.Formatting
{
    public interface ITimeAgoFormatter
    {
        /// <summary>
        /// Convierte una fecha en texto relativo: "Just now", "5m ago", "2h ago", "3d ago", etc.
        /// </summary>
        string Format(DateTime dateTime);
    }
}