using System;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OneMoreSpin.DAL.EF;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.Services.Interfaces;
using OneMoreSpin.ViewModels.VM;

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

        public async Task<ClaimRewardResultVm> ClaimDailyRewardAsync(string userId)
        {
            if (!int.TryParse(userId, out int parsedUserId))
            {
                return new ClaimRewardResultVm { Success = false };
            }

            var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Id == parsedUserId);

            if (user == null)
            {
                return new ClaimRewardResultVm { Success = false };
            }

            var currentTime = DateTime.UtcNow;

            if (user.LastRewardClaimedDate.HasValue)
            {
                var timeSinceLastClaim = currentTime - user.LastRewardClaimedDate.Value;

                if (timeSinceLastClaim.TotalHours < 24)
                {
                    var timeRemaining = TimeSpan.FromHours(24) - timeSinceLastClaim;
                    return new ClaimRewardResultVm
                    {
                        Success = false,
                        NextClaimAvailableIn = timeRemaining,
                    };
                }

                // Jeśli minęło 24-48h, kontynuuj serię. W przeciwnym razie (ponad 48h) seria jest resetowana do 1.
                user.DailyStreak = (timeSinceLastClaim.TotalHours <= 48) ? user.DailyStreak + 1 : 1;
            }
            else
            {
                // Pierwsze odebranie nagrody w historii
                user.DailyStreak = 1;
            }

            // Jeśli seria przekroczy maksimum, zresetuj ją do 1 (zapętlenie)
            if (user.DailyStreak > MaxStreakDays)
            {
                user.DailyStreak = 1;
            }

            decimal rewardAmount = BaseRewardAmount + (BaseRewardAmount * (user.DailyStreak - 1));

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

            return new ClaimRewardResultVm
            {
                Success = true,
                Amount = rewardAmount,
                DailyStreak = user.DailyStreak,
            };
        }
    }
}
