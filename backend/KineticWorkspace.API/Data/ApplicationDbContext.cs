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
        public DbSet<Amenity> Amenities { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 🔥 Configurar nombres de tablas explícitamente (con plural)
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Space>().ToTable("Spaces");
            modelBuilder.Entity<Reservation>().ToTable("Reservations");
            modelBuilder.Entity<Amenity>().ToTable("Amenities");
            modelBuilder.Entity<Payment>().ToTable("Payments");
            modelBuilder.Entity<Review>().ToTable("Reviews");
            modelBuilder.Entity<RefreshToken>().ToTable("RefreshTokens");
            modelBuilder.Entity<AuditLog>().ToTable("AuditLogs");

            // Configurar relaciones
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Space)
                .WithMany(s => s.Reservations)
                .HasForeignKey(r => r.SpaceId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Reservation)
                .WithMany(r => r.Payments)
                .HasForeignKey(p => p.ReservationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.User)
                .WithMany(u => u.Payments)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Space)
                .WithMany(s => s.Reviews)
                .HasForeignKey(r => r.SpaceId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AuditLog>()
                .HasOne(al => al.User)
                .WithMany(u => u.AuditLogs)
                .HasForeignKey(al => al.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            // Índices para mejorar rendimiento
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.IsActive);

            modelBuilder.Entity<Space>()
                .HasIndex(s => s.City);

            modelBuilder.Entity<Space>()
                .HasIndex(s => s.Type);

            modelBuilder.Entity<Space>()
                .HasIndex(s => s.IsActive);

            modelBuilder.Entity<Space>()
                .HasIndex(s => s.IsAvailable);

            modelBuilder.Entity<Space>()
                .HasIndex(s => s.IsFeatured);

            modelBuilder.Entity<Reservation>()
                .HasIndex(r => new { r.StartTime, r.EndTime });

            modelBuilder.Entity<Reservation>()
                .HasIndex(r => r.Status);

            modelBuilder.Entity<Reservation>()
                .HasIndex(r => r.UserId);

            modelBuilder.Entity<Reservation>()
                .HasIndex(r => r.SpaceId);

            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.Status);

            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.UserId);

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => rt.Token)
                .IsUnique();

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => rt.UserId);

            // Configurar valores por defecto
            modelBuilder.Entity<User>()
                .Property(u => u.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<Space>()
                .Property(s => s.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<Reservation>()
                .Property(r => r.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<Payment>()
                .Property(p => p.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<Review>()
                .Property(r => r.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<AuditLog>()
                .Property(a => a.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Relación Many-to-Many: Space <-> Amenity
            modelBuilder.Entity<Space>()
                .HasMany(s => s.Amenities)
                .WithMany(a => a.Spaces)
                .UsingEntity(j => j.ToTable("SpaceAmenities"));

            // Configurar precisión de decimales
            modelBuilder.Entity<Space>()
                .Property(s => s.PricePerHour)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Space>()
                .Property(s => s.PricePerDay)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Reservation>()
                .Property(r => r.TotalPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(18, 2);

            // Configurar propiedad ImageUrls como string largo
            modelBuilder.Entity<Space>()
                .Property(s => s.ImageUrls)
                .HasMaxLength(2000); // Aumentar longitud para múltiples URLs
        }
    }
}