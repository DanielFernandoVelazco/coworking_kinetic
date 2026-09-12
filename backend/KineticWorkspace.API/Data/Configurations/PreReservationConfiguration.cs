using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Data.Configurations
{
    public class PreReservationConfiguration : IEntityTypeConfiguration<PreReservation>
    {
        public void Configure(EntityTypeBuilder<PreReservation> builder)
        {
            builder.ToTable("PreReservations");

            // PreReservation -> User
            builder.HasOne(pr => pr.User)
                .WithMany()
                .HasForeignKey(pr => pr.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // PreReservation -> Space
            builder.HasOne(pr => pr.Space)
                .WithMany()
                .HasForeignKey(pr => pr.SpaceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Índices
            builder.HasIndex(pr => pr.SessionId);
            builder.HasIndex(pr => new { pr.UserId, pr.Status });
            builder.HasIndex(pr => pr.ExpiresAt);

            // Precisión decimal
            builder.Property(pr => pr.TotalPrice).HasPrecision(18, 2);
            builder.Property(pr => pr.PaidAmount).HasPrecision(18, 2);
        }
    }
}