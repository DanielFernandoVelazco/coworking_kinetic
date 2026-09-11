namespace KineticWorkspace.API.Services.Interfaces.Admin
{
    public interface IAdminReportService
    {
        Task<byte[]> ExportReportAsync(DateTime startDate, DateTime endDate);
    }
}