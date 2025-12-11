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

        private (bool canClaim, int nextStreak, int currentStreak, TimeSpan? timeUntilNext) CalculateRewardEligibility(
            User user,
            DateTime currentTime,
            DateTime currentDate)
        {
            bool canClaim = true;
            TimeSpan? timeUntilNext = null;
            int currentStreak = user.DailyStreak;
            int nextStreak = 1;

            if (!user.LastRewardClaimedDate.HasValue)
            {
                // Pierwsze odebranie w historii
                return (true, 1, 0, null);
            }

            var lastClaimDate = user.LastRewardClaimedDate.Value.Date;
            var daysDifference = (currentDate - lastClaimDate).Days;

            if (daysDifference == 0)
            {
                // blok jesli juz odebral
                canClaim = false;
                var nextMidnight = currentDate.AddDays(1);
                timeUntilNext = nextMidnight - currentTime;

                // Następny streak to obecny + 1
                nextStreak = user.DailyStreak + 1;
                if (nextStreak > MaxStreakDays)
                {
                    nextStreak = 1;
                }
            }
            else if (daysDifference == 1)
            {
                // Wczoraj odebrał wiec moze odebrac
                canClaim = true;
                nextStreak = user.DailyStreak + 1;
                if (nextStreak > MaxStreakDays)
                {
                    nextStreak = 1;
                }
            }
            else 
            {
                // Przerwał serię - reset
                canClaim = true;
                currentStreak = 0;
                nextStreak = 1;
            }

            return (canClaim, nextStreak, currentStreak, timeUntilNext);
        }

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
            var currentDate = currentTime.Date;

            var (canClaim, nextStreak, currentStreak, timeUntilNext) = 
                CalculateRewardEligibility(user, currentTime, currentDate);

            // Jeśli nie może odebrać
            if (!canClaim)
            {
                return new ClaimRewardResultVm
                {
                    Success = false,
                    DailyStreak = user.DailyStreak,
                    NextClaimAvailableIn = timeUntilNext,
                };
            }

            // Jeśli reset streak 
            if (currentStreak == 0 && user.DailyStreak > 0)
            {
                user.DailyStreak = 0;
                await DbContext.SaveChangesAsync();

                Logger.LogInformation(
                    $"Użytkownik {userId} przerwał serię. Streak zresetowany."
                );
            }

            // Zaktualizuj streak
            user.DailyStreak = nextStreak;

            // Oblicz nagrodę
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

        public async Task<DailyRewardStatusVm> GetDailyRewardStatusAsync(string userId)
        {
            if (!int.TryParse(userId, out int parsedUserId))
            {
                return new DailyRewardStatusVm 
                { 
                    CanClaim = false,
                    CurrentStreak = 0,
                    NextRewardStreak = 1,
                    NextRewardAmount = BaseRewardAmount
                };
            }

            var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Id == parsedUserId);

            if (user == null)
            {
                return new DailyRewardStatusVm 
                { 
                    CanClaim = false,
                    CurrentStreak = 0,
                    NextRewardStreak = 1,
                    NextRewardAmount = BaseRewardAmount
                };
            }

            var currentTime = DateTime.UtcNow;
            var currentDate = currentTime.Date;

            // Użyj wspólnej logiki
            var (canClaim, nextStreak, currentStreak, timeUntilNext) = 
                CalculateRewardEligibility(user, currentTime, currentDate);

            // Oblicz kwotę następnej nagrody
            decimal nextRewardAmount = BaseRewardAmount + (BaseRewardAmount * (nextStreak - 1));

            return new DailyRewardStatusVm
            {
                CanClaim = canClaim,
                CurrentStreak = currentStreak,
                NextRewardStreak = nextStreak,
                NextRewardAmount = nextRewardAmount,
                LastClaimedDate = user.LastRewardClaimedDate,
                TimeUntilNextClaim = timeUntilNext
            };
        }
    }
}
