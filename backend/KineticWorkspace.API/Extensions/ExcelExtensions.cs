using OfficeOpenXml;

namespace KineticWorkspace.API.Extensions
{
    public static class ExcelExtensions
    {
        public static WebApplicationBuilder ConfigureExcel(this WebApplicationBuilder builder)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            return builder;
        }
    }
}