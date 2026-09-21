// Models/Entities/InvoiceCounter.cs
using System.ComponentModel.DataAnnotations;

namespace KineticWorkspace.API.Models.Entities
{
    /// <summary>
    /// Contador atómico de números de factura por año.
    /// Una sola fila por año (PK = Year).
    /// </summary>
    public class InvoiceCounter
    {
        [Key]
        public int Year { get; set; }

        public int LastNumber { get; set; }
    }
}