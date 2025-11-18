using System;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OneMoreSpin.DAL.EF;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.Services.Interfaces;

namespace OneMoreSpin.Services.ConcreteServices
{
    public class RewardService : BaseService, IRewardService
    {
        private const decimal BaseRewardAmount = 50;
        private const int MaxStreakDays = 7;

        public RewardService(
            ApplicationDbContext dbContext,
            IMapper mapper,
            ILogger<RewardService> logger
        )
            : base(dbContext, mapper, logger) { }

        public async Task<(bool Success, string Message, decimal Amount)> ClaimDailyRewardAsync(string userId)
        {
            if (!int.TryParse(userId, out int parsedUserId))
            {
                return (false, "Nieprawidłowy format ID użytkownika.", 0);
            }

            var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Id == parsedUserId);

            if (user == null)
            {
                return (false, "Użytkownik nie został znaleziony.", 0);
            }

            var currentTime = DateTime.UtcNow;

            // Pierwsze odebranie nagrody przez użytkownika
            if (!user.LastRewardClaimedDate.HasValue)
            {
                user.DailyStreak = 1;
            }
            else
            {
                var timeSinceLastClaim = currentTime - user.LastRewardClaimedDate.Value;

                if (timeSinceLastClaim.TotalHours < 24)
                {
                    var timeRemaining = TimeSpan.FromHours(24) - timeSinceLastClaim;
                    return (false, $"Następną nagrodę możesz odebrać za {timeRemaining.Hours}h {timeRemaining.Minutes}m.", 0);
                }

                // Jeśli minęło więcej niż 48h, zresetuj serię
                if (timeSinceLastClaim.TotalHours > 48)
                {
                    user.DailyStreak = 1;
                }
                else // Jeśli minęło 24-48h, kontynuuj serię
                {
                    user.DailyStreak++;
                }
            }

            // Zresetuj serię po osiągnięciu maksimum
            if (user.DailyStreak > MaxStreakDays)
            {
                user.DailyStreak = 1;
            }

            // Oblicz kwotę nagrody
            decimal rewardAmount = BaseRewardAmount + (BaseRewardAmount * (user.DailyStreak - 1));

            // Zaktualizuj dane użytkownika
            user.Balance += rewardAmount;
            user.LastRewardClaimedDate = currentTime;

            var payment = new Payment
            {
                Amount = rewardAmount,
                CreatedAt = currentTime,
                TransactionType = TransactionType.Bonus,
                UserId = user.Id,
            };

            await DbContext.Payments.AddAsync(payment);
            await DbContext.SaveChangesAsync();

            Logger.LogInformation(
                $"Użytkownik {userId} odebrał nagrodę za {user.DailyStreak} dzień serii w wysokości {rewardAmount}. Nowe saldo: {user.Balance}"
            );

            return (
                true,
                $"Przyznano nagrodę za {user.DailyStreak} dzień z rzędu w wysokości {rewardAmount}!",
                rewardAmount
            );
        }
    }
}
