using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Data.Configurations
{
    public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
    {
        public void Configure(EntityTypeBuilder<Reservation> builder)
        {
            builder.ToTable("Reservations");

            // Reservation -> User
            builder.HasOne(r => r.User)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Reservation -> Space
            builder.HasOne(r => r.Space)
                .WithMany(s => s.Reservations)
                .HasForeignKey(r => r.SpaceId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}