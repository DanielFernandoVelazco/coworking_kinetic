// backend/KineticWorkspace.API/Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Space> Spaces { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<PreReservation> PreReservations { get; set; } // ✅ NUEVO
        public DbSet<Invoice> Invoices { get; set; } // ✅ NUEVO
        public DbSet<Amenity> Amenities { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configurar nombres de tablas
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Space>().ToTable("Spaces");
            modelBuilder.Entity<Reservation>().ToTable("Reservations");
            modelBuilder.Entity<PreReservation>().ToTable("PreReservations"); // ✅ NUEVO
            modelBuilder.Entity<Invoice>().ToTable("Invoices"); // ✅ NUEVO
            modelBuilder.Entity<Amenity>().ToTable("Amenities");
            modelBuilder.Entity<Payment>().ToTable("Payments");
            modelBuilder.Entity<Review>().ToTable("Reviews");
            modelBuilder.Entity<RefreshToken>().ToTable("RefreshTokens");
            modelBuilder.Entity<AuditLog>().ToTable("AuditLogs");
            modelBuilder.Entity<PasswordResetToken>().ToTable("PasswordResetTokens");

            // 🔥 Configurar relaciones

            // PreReservation -> User
            modelBuilder.Entity<PreReservation>()
                .HasOne(pr => pr.User)
                .WithMany()
                .HasForeignKey(pr => pr.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // PreReservation -> Space
            modelBuilder.Entity<PreReservation>()
                .HasOne(pr => pr.Space)
                .WithMany()
                .HasForeignKey(pr => pr.SpaceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Invoice -> User
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.User)
                .WithMany()
                .HasForeignKey(i => i.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Invoice -> Reservation
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Reservation)
                .WithMany()
                .HasForeignKey(i => i.ReservationId)
                .OnDelete(DeleteBehavior.Restrict);

            // Invoice -> Payments
            modelBuilder.Entity<Invoice>()
                .HasMany(i => i.Payments)
                .WithOne(p => p.Invoice)
                .HasForeignKey(p => p.InvoiceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Reservation -> User (existente)
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Reservation -> Space (existente)
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Space)
                .WithMany(s => s.Reservations)
                .HasForeignKey(r => r.SpaceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Payment -> Reservation (existente)
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Reservation)
                .WithMany(r => r.Payments)
                .HasForeignKey(p => p.ReservationId)
                .OnDelete(DeleteBehavior.Restrict);

            // Payment -> User (existente)
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.User)
                .WithMany(u => u.Payments)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            modelBuilder.Entity<PreReservation>()
                .HasIndex(pr => pr.SessionId);

            modelBuilder.Entity<PreReservation>()
                .HasIndex(pr => new { pr.UserId, pr.Status });

            modelBuilder.Entity<PreReservation>()
                .HasIndex(pr => pr.ExpiresAt);

            modelBuilder.Entity<Invoice>()
                .HasIndex(i => i.InvoiceNumber)
                .IsUnique();

            modelBuilder.Entity<Invoice>()
                .HasIndex(i => new { i.UserId, i.Status });

            // Precisión de decimales
            modelBuilder.Entity<Invoice>()
                .Property(i => i.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Invoice>()
                .Property(i => i.TaxAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Invoice>()
                .Property(i => i.DiscountAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PreReservation>()
                .Property(pr => pr.TotalPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PreReservation>()
                .Property(pr => pr.PaidAmount)
                .HasPrecision(18, 2);

            // Resto de configuraciones existentes...
            // (Mantener las configuraciones de Space, Amenity, etc.)
        }
    }
}