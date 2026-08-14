// backend/KineticWorkspace.API/Services/Implementations/InvoiceService.cs
using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Data;
using KineticWorkspace.API.Models.Entities;
using KineticWorkspace.API.Services.Interfaces;

namespace KineticWorkspace.API.Services.Implementations
{
    public class InvoiceService : IInvoiceService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<InvoiceService> _logger;

        public InvoiceService(ApplicationDbContext context, ILogger<InvoiceService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<string> GenerateInvoiceNumberAsync()
        {
            var year = DateTime.UtcNow.Year;
            var prefix = $"INV-{year}-";

            var lastInvoice = await _context.Invoices
                .Where(i => i.InvoiceNumber.StartsWith(prefix))
                .OrderByDescending(i => i.InvoiceNumber)
                .FirstOrDefaultAsync();

            int nextNumber = 1;
            if (lastInvoice != null)
            {
                var lastNumber = lastInvoice.InvoiceNumber.Replace(prefix, "");
                if (int.TryParse(lastNumber, out int num))
                {
                    nextNumber = num + 1;
                }
            }

            return $"{prefix}{nextNumber:D4}";
        }

        public async Task<Invoice> CreateInvoiceAsync(int userId, int reservationId, decimal totalAmount, string paymentMethod, string? transactionId)
        {
            var invoiceNumber = await GenerateInvoiceNumberAsync();

            var invoice = new Invoice
            {
                InvoiceNumber = invoiceNumber,
                UserId = userId,
                ReservationId = reservationId,
                TotalAmount = totalAmount,
                Status = "Pending",
                PaymentMethod = paymentMethod,
                TransactionId = transactionId,
                CreatedAt = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(15)
            };

            await _context.Invoices.AddAsync(invoice);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Factura creada: {InvoiceNumber} para usuario {UserId}", invoiceNumber, userId);
            return invoice;
        }

        public async Task<bool> MarkInvoiceAsPaidAsync(int invoiceId, string transactionId)
        {
            var invoice = await _context.Invoices.FindAsync(invoiceId);
            if (invoice == null) return false;

            invoice.Status = "Paid";
            invoice.PaidAt = DateTime.UtcNow;
            invoice.TransactionId = transactionId ?? invoice.TransactionId;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Factura marcada como pagada: {InvoiceNumber}", invoice.InvoiceNumber);
            return true;
        }

        public async Task<bool> MarkInvoiceAsCancelledAsync(int invoiceId)
        {
            var invoice = await _context.Invoices.FindAsync(invoiceId);
            if (invoice == null || invoice.Status == "Paid") return false;

            invoice.Status = "Cancelled";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkInvoiceAsRefundedAsync(int invoiceId)
        {
            var invoice = await _context.Invoices.FindAsync(invoiceId);
            if (invoice == null || invoice.Status != "Paid") return false;

            invoice.Status = "Refunded";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Invoice?> GetInvoiceByIdAsync(int invoiceId)
        {
            return await _context.Invoices
                .Include(i => i.User)
                .Include(i => i.Reservation)
                .Include(i => i.Payments)
                .FirstOrDefaultAsync(i => i.Id == invoiceId);
        }

        public async Task<IEnumerable<Invoice>> GetUserInvoicesAsync(int userId)
        {
            return await _context.Invoices
                .Include(i => i.Reservation)
                .Include(i => i.Payments)
                .Where(i => i.UserId == userId)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
        }
    }
}