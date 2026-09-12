using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Data.Configurations
{
    public class AlertConfiguration : IEntityTypeConfiguration<Alert>
    {
        public void Configure(EntityTypeBuilder<Alert> builder)
        {
            builder.ToTable("Alerts");

            // Alert -> User
            builder.HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Índices
            builder.HasIndex(a => new { a.UserId, a.IsRead });
            builder.HasIndex(a => a.CreatedAt);
            builder.HasIndex(a => a.Type);
            builder.HasIndex(a => a.Category);
        }
    }
}