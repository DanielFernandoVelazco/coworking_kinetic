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
        /// Se auto-recupera si el contador está desincronizado con las facturas existentes.
        /// </summary>
        public async Task<string> GenerateInvoiceNumberAsync()
        {
            var year = DateTime.UtcNow.Year;
            const int maxRetries = 3;

            for (int attempt = 0; attempt < maxRetries; attempt++)
            {
                // 1. Intentar incrementar (si la fila existe)
                var affected = await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE InvoiceCounters SET LastNumber = LastNumber + 1 WHERE Year = {0}",
                    year);

                // 2. Si no existe la fila, crearla sincronizada con las facturas existentes
                if (affected == 0)
                {
                    var maxExisting = await GetMaxInvoiceNumberForYearAsync(year);

                    try
                    {
                        await _context.Database.ExecuteSqlRawAsync(
                            "INSERT INTO InvoiceCounters (Year, LastNumber) VALUES ({0}, {1})",
                            year, maxExisting);
                    }
                    catch (DbUpdateException)
                    {
                        // Race: otro proceso la creó primero → continuar
                    }

                    // Después de crear, hacer el UPDATE otra vez para obtener el número
                    await _context.Database.ExecuteSqlRawAsync(
                        "UPDATE InvoiceCounters SET LastNumber = LastNumber + 1 WHERE Year = {0}",
                        year);
                }

                // 3. Leer el valor actual
                var counter = await _context.InvoiceCounters
                    .FromSqlRaw("SELECT * FROM InvoiceCounters WHERE Year = {0}", year)
                    .AsNoTracking()
                    .FirstAsync();

                var invoiceNumber = $"INV-{year}-{counter.LastNumber:D4}";

                // 4. Verificar que NO exista ya en Invoices
                var alreadyExists = await _context.Invoices
                    .AnyAsync(i => i.InvoiceNumber == invoiceNumber);

                if (!alreadyExists)
                {
                    _logger.LogInformation("Número de factura generado: {InvoiceNumber}", invoiceNumber);
                    return invoiceNumber;
                }

                // Si ya existe → el counter está desincronizado → resync y reintentar
                _logger.LogWarning(
                    "InvoiceNumber {InvoiceNumber} ya existe. Resincronizando counter...",
                    invoiceNumber);

                var maxExistingSync = await GetMaxInvoiceNumberForYearAsync(year);
                await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE InvoiceCounters SET LastNumber = {0} WHERE Year = {1}",
                    maxExistingSync, year);
            }

            throw new InvalidOperationException(
                $"No se pudo generar un número de factura único después de {maxRetries} intentos.");
        }

        /// <summary>
        /// Obtiene el número más alto de factura existente para un año dado.
        /// Ej: si existen INV-2026-0001 y INV-2026-0007, devuelve 7.
        /// </summary>
        private async Task<int> GetMaxInvoiceNumberForYearAsync(int year)
        {
            var prefix = $"INV-{year}-";

            var numbers = await _context.Invoices
                .Where(i => i.InvoiceNumber.StartsWith(prefix))
                .Select(i => i.InvoiceNumber)
                .ToListAsync();

            if (!numbers.Any()) return 0;

            var max = 0;
            foreach (var number in numbers)
            {
                var suffix = number.Substring(prefix.Length);
                if (int.TryParse(suffix, out var n) && n > max)
                    max = n;
            }

            return max;
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

            // ✅ SIN SaveChanges. El llamador controla la transacción.
            // ⚠️ IMPORTANTE: el llamador DEBE llamar SaveChanges antes de usar invoice.Id

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

            _logger.LogInformation(
                "Factura marcada como pagada (pendiente de guardar): {InvoiceNumber}",
                invoice.InvoiceNumber);
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