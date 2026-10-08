// backend/KineticWorkspace.API/Services/Interfaces/IInvoiceService.cs
using KineticWorkspace.API.Models.DTOs.PreReservations;
using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Services.Interfaces
{
    public interface IInvoiceService
    {
        Task<string> GenerateInvoiceNumberAsync();
        Task<Invoice> CreateInvoiceAsync(int userId, int reservationId, decimal totalAmount, string paymentMethod, string? transactionId);
        Task<bool> MarkInvoiceAsPaidAsync(int invoiceId, string transactionId);
        Task<bool> MarkInvoiceAsCancelledAsync(int invoiceId);
        Task<bool> MarkInvoiceAsRefundedAsync(int invoiceId);
        Task<Invoice?> GetInvoiceByIdAsync(int invoiceId);
        Task<IEnumerable<Invoice>> GetUserInvoicesAsync(int userId);
    }
}