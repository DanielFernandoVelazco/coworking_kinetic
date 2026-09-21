// backend/KineticWorkspace.API/Services/Interfaces/IInvoiceService.cs
using KineticWorkspace.API.Models.DTOs.PreReservations;
using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Services.Interfaces
{
    public interface IInvoiceService
    {
        /// <summary>
        /// Genera el siguiente número de factura del año. Incrementa el contador
        /// en BD de forma atómica (SQL raw dentro de la transacción actual).
        /// </summary>
        Task<string> GenerateInvoiceNumberAsync();

        /// <summary>
        /// Crea una factura y la añade al contexto. NO hace SaveChanges.
        /// El llamador DEBE ejecutar SaveChanges dentro de una transacción.
        /// </summary>
        Task<Invoice> CreateInvoiceAsync(int userId, int reservationId, decimal totalAmount, string paymentMethod, string? transactionId);

        /// <summary>
        /// Marca la factura como pagada. NO hace SaveChanges.
        /// El llamador DEBE ejecutar SaveChanges dentro de una transacción.
        /// </summary>
        Task<bool> MarkInvoiceAsPaidAsync(int invoiceId, string transactionId);

        Task<bool> MarkInvoiceAsCancelledAsync(int invoiceId);
        Task<bool> MarkInvoiceAsRefundedAsync(int invoiceId);
        Task<Invoice?> GetInvoiceByIdAsync(int invoiceId);
        Task<IEnumerable<Invoice>> GetUserInvoicesAsync(int userId);
    }
}