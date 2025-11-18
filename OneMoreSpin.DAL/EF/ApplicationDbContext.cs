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
    
    // --- NOWE ---
    public DbSet<Mission> Missions { get; set; }
    public DbSet<UserMission> UserMissions { get; set; }
    public DbSet<UserPlayedGame> UserPlayedGames { get; set; }
    // --- KONIEC NOWEGO ---

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

        // --- NOWE ---
        modelBuilder
            .Entity<UserMission>()
            .HasOne(um => um.User)
            .WithMany(u => u.UserMissions)
            .HasForeignKey(um => um.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<UserMission>()
            .HasOne(um => um.Mission)
            .WithMany(m => m.UserMissions)
            .HasForeignKey(um => um.MissionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserPlayedGame>().HasKey(upg => new { upg.UserId, upg.GameId });

        modelBuilder
            .Entity<UserPlayedGame>()
            .HasOne(upg => upg.User)
            .WithMany()
            .HasForeignKey(upg => upg.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<UserPlayedGame>()
            .HasOne(upg => upg.Game)
            .WithMany()
            .HasForeignKey(upg => upg.GameId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
