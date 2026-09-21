// Services/Implementations/InvoiceService.cs
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

        /// <summary>
        /// Genera el siguiente número de factura del año usando un contador atómico.
        /// Debe llamarse DENTRO de una transacción para que el incremento
        /// se revierta si el resto de la operación falla.
        /// </summary>
        public async Task<string> GenerateInvoiceNumberAsync()
        {
            var year = DateTime.UtcNow.Year;

            // ✅ FIX C6: incremento atómico con UPDATE ... RETURNING
            // MySQL 8+ soporta RETURNING con esta sintaxis vía EF
            // Alternativa portable: UPDATE + SELECT dentro de la misma transacción.

            var affected = await _context.Database.ExecuteSqlRawAsync(
                "UPDATE InvoiceCounters SET LastNumber = LastNumber + 1 WHERE Year = {0}",
                year);

            if (affected == 0)
            {
                // No existe fila para este año → crearla (por si no se sembró)
                try
                {
                    await _context.InvoiceCounters.AddAsync(new InvoiceCounter
                    {
                        Year = year,
                        LastNumber = 1
                    });
                    await _context.SaveChangesAsync();

                    _logger.LogInformation("InvoiceCounter {Year} creado con LastNumber=1", year);
                    return $"INV-{year}-0001";
                }
                catch (DbUpdateException)
                {
                    // Race: otro request lo creó → reintentar el UPDATE
                    await _context.Database.ExecuteSqlRawAsync(
                        "UPDATE InvoiceCounters SET LastNumber = LastNumber + 1 WHERE Year = {0}",
                        year);
                }
            }

            // Leer el número actualizado
            var counter = await _context.InvoiceCounters
                .AsNoTracking()
                .FirstAsync(c => c.Year == year);

            var invoiceNumber = $"INV-{year}-{counter.LastNumber:D4}";
            _logger.LogInformation("Número de factura generado: {InvoiceNumber}", invoiceNumber);
            return invoiceNumber;
        }

        public async Task<Invoice> CreateInvoiceAsync(
    int userId,
    int reservationId,
    decimal totalAmount,
    string paymentMethod,
    string? transactionId)
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

            // ✅ FIX: sin SaveChanges. El llamador controla la transacción.
            // Si este método se usa fuera de una transacción, el llamador DEBE llamar SaveChanges.

            _logger.LogInformation(
                "Factura preparada (pendiente de guardar): {InvoiceNumber} para usuario {UserId}",
                invoiceNumber, userId);

            return invoice;
        }

        public async Task<bool> MarkInvoiceAsPaidAsync(int invoiceId, string transactionId)
        {
            var invoice = await _context.Invoices.FindAsync(invoiceId);
            if (invoice == null) return false;

            invoice.Status = "Paid";
            invoice.PaidAt = DateTime.UtcNow;
            invoice.TransactionId = transactionId ?? invoice.TransactionId;

            // ✅ FIX: sin SaveChanges. Solo modificamos la entidad en el contexto.
            _logger.LogInformation("Factura marcada como pagada (pendiente de guardar): {InvoiceNumber}", invoice.InvoiceNumber);
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