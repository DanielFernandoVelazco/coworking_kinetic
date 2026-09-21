using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Data.Configurations
{
    public class InvoiceCounterConfiguration : IEntityTypeConfiguration<InvoiceCounter>
    {
        public void Configure(EntityTypeBuilder<InvoiceCounter> builder)
        {
            builder.ToTable("InvoiceCounters");
            builder.HasKey(c => c.Year);
            builder.Property(c => c.LastNumber).IsRequired();
        }
    }
}