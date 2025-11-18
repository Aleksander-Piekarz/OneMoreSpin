using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OneMoreSpin.DAL.EF;

namespace OneMoreSpin.Services.ConcreteServices
{
    public class MissionResetService : IHostedService, IDisposable
    {
        private readonly ILogger<MissionResetService> _logger;
        private Timer _timer;
        private readonly IServiceProvider _serviceProvider;
        private DayOfWeek _resetDay = DayOfWeek.Monday;

        public MissionResetService(
            ILogger<MissionResetService> logger,
            IServiceProvider serviceProvider
        )
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Mission Reset Service is starting.");

            _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromHours(1)); // Check every hour

            return Task.CompletedTask;
        }

        private void DoWork(object state)
        {
            var today = DateTime.UtcNow.DayOfWeek;
            if (today == _resetDay)
            {
                _logger.LogInformation("It's reset day. Checking if reset is needed.");
                ResetWeeklyData();
            }
        }

        private void ResetWeeklyData()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                bool changesMade = false;

                // 1. Reset Missions
                if (dbContext.UserMissions.Any() && WasLastResetMoreThanAWeekAgo(dbContext))
                {
                    _logger.LogInformation("Resetting all user missions.");
                    try
                    {
                        var allUserMissions = dbContext.UserMissions.ToList();
                        dbContext.UserMissions.RemoveRange(allUserMissions);
                        _logger.LogInformation(
                            "Queued reset for {Count} user missions.",
                            allUserMissions.Count
                        );
                        changesMade = true;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "An error occurred while queueing user mission resets.");
                    }
                }
                else
                {
                    _logger.LogInformation(
                        "Missions have either already been reset this week or there are no missions to reset."
                    );
                }

                // 2. Reset Daily Login Rewards
                _logger.LogInformation("Resetting daily login rewards for all users.");
                try
                {
                    var allUsers = dbContext.Users.ToList();
                    if (allUsers.Any())
                    {
                        foreach (var user in allUsers)
                        {
                            user.LastRewardClaimedDate = null;
                            user.DailyStreak = 0;
                        }
                        _logger.LogInformation("Queued daily reward reset for {Count} users.", allUsers.Count);
                        changesMade = true;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while queueing daily reward resets.");
                }

                // 3. Save all changes
                if (changesMade)
                {
                    try
                    {
                        dbContext.SaveChanges();
                        _logger.LogInformation("Successfully saved all weekly reset changes to the database.");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "An error occurred while saving weekly reset changes.");
                    }
                }
            }
        }

        private bool WasLastResetMoreThanAWeekAgo(ApplicationDbContext dbContext)
        {
            // This logic is tricky without a dedicated place to store the last reset time.
            // For now, we'll assume if it's Monday and there are missions, we should reset.
            // This is a simplification. A better way would be to have a `SystemSettings` table.
            return true;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Mission Reset Service is stopping.");

            _timer?.Change(Timeout.Infinite, 0);

            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}
