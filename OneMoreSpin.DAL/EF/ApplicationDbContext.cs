using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using OneMoreSpin.Model.DataModels;

namespace OneMoreSpin.DAL.EF;

public class ApplicationDbContext : IdentityDbContext<User, Role, int>
{
    // table properties
    public DbSet<ChatMessage> ChatMessages { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<Lobby> Lobbies { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<UserScore> UserScores { get; set; }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.UseLazyLoadingProxies();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Fluent API commands
        modelBuilder
            .Entity<ChatMessage>()
            .HasOne(u => u.User)
            .WithMany(c => c.ChatMessages)
            .HasForeignKey(u => u.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<Game>()
            .HasMany(l => l.Lobbies)
            .WithOne(g => g.Game)
            .HasForeignKey(g => g.GameId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder
            .Entity<Game>()
            .HasMany(us => us.UserScores)
            .WithOne(g => g.Game)
            .HasForeignKey(g => g.GameId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder
            .Entity<UserScore>()
            .HasOne(u => u.User)
            .WithMany(us => us.UserScores)
            .HasForeignKey(u => u.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder
            .Entity<Payment>()
            .HasOne(u => u.User)
            .WithMany(p => p.Payments)
            .HasForeignKey(u => u.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<User>()
            .HasOne(l => l.Lobby)
            .WithMany(u => u.Users)
            .HasForeignKey(l => l.LobbyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .Property(u => u.DateOfBirth)
            .HasColumnType("date");
    }
}
