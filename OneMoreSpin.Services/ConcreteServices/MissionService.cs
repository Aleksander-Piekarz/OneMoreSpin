using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OneMoreSpin.DAL.EF;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.Services.Interfaces;

namespace OneMoreSpin.Services.ConcreteServices
{
    public class MissionService : BaseService, IMissionService
    {
        public MissionService(
            ApplicationDbContext dbContext,
            IMapper mapper,
            ILogger<MissionService> logger
        )
            : base(dbContext, mapper, logger) { }

        public async Task<IEnumerable<UserMission>> GetOrUpdateMissionProgressAsync(
            string userId,
            MissionType? missionType = null,
            decimal? valueToAdd = null
        )
        {
            if (!int.TryParse(userId, out int parsedUserId))
            {
                return new List<UserMission>();
            }

            // If update parameters are provided, update the progress first.
            if (missionType.HasValue && valueToAdd.HasValue)
            {
                var missionsToUpdate = await DbContext
                    .Missions.Where(m => m.MissionType == missionType.Value)
                    .ToListAsync();

                foreach (var mission in missionsToUpdate)
                {
                    var userMission = await DbContext.UserMissions.FirstOrDefaultAsync(um =>
                        um.UserId == parsedUserId && um.MissionId == mission.Id
                    );

                    if (userMission == null)
                    {
                        userMission = new UserMission
                        {
                            UserId = parsedUserId,
                            MissionId = mission.Id,
                            CurrentProgress = 0,
                            IsCompleted = false,
                            IsClaimed = false,
                        };
                        DbContext.UserMissions.Add(userMission);
                    }

                    if (userMission.IsCompleted)
                    {
                        continue;
                    }

                    userMission.CurrentProgress += valueToAdd.Value;

                    if (userMission.CurrentProgress >= mission.RequiredAmount)
                    {
                        userMission.CurrentProgress = mission.RequiredAmount;
                        userMission.IsCompleted = true;
                    }
                }

                await DbContext.SaveChangesAsync();
            }

            // Always return the full, up-to-date list of all missions for the user.
            var allMissions = await DbContext.Missions.ToListAsync();
            var userMissions = await DbContext
                .UserMissions.Where(um => um.UserId == parsedUserId)
                .Include(um => um.Mission)
                .ToListAsync();

            var userMissionsDict = userMissions.ToDictionary(um => um.MissionId);
            var result = new List<UserMission>();

            foreach (var mission in allMissions)
            {
                if (userMissionsDict.TryGetValue(mission.Id, out var userMission))
                {
                    result.Add(userMission);
                }
                else
                {
                    // If user has no progress on this mission, create a new transient entry to show it.
                    result.Add(
                        new UserMission
                        {
                            UserId = parsedUserId,
                            MissionId = mission.Id,
                            Mission = mission,
                            CurrentProgress = 0,
                            IsCompleted = false,
                            IsClaimed = false,
                        }
                    );
                }
            }

            return result;
        }

        public async Task<(bool Success, string Message)> ClaimMissionRewardAsync(
            string userId,
            int missionId
        )
        {
            if (!int.TryParse(userId, out int parsedUserId))
            {
                return (false, "Nieprawidłowy format ID użytkownika.");
            }

            var userMission = await DbContext
                .UserMissions.Include(um => um.Mission) // We need Mission details for the reward amount
                .FirstOrDefaultAsync(um => um.UserId == parsedUserId && um.MissionId == missionId);

            if (userMission == null)
            {
                return (false, "Nie znaleziono postępu dla tej misji.");
            }

            if (!userMission.IsCompleted)
            {
                return (false, "Misja nie została jeszcze ukończona.");
            }

            if (userMission.IsClaimed)
            {
                return (false, "Nagroda za tę misję została już odebrana.");
            }

            var user = await DbContext.Users.FindAsync(parsedUserId);
            if (user == null)
            {
                return (false, "Nie znaleziono użytkownika.");
            }

            var rewardAmount = userMission.Mission.RewardAmount;

            user.Balance += rewardAmount;
            userMission.IsClaimed = true;

            var payment = new Payment
            {
                Amount = rewardAmount,
                CreatedAt = DateTime.UtcNow,
                TransactionType = TransactionType.Bonus, // Assuming 'Bonus' is for mission rewards
                UserId = parsedUserId,
            };

            DbContext.Payments.Add(payment);
            await DbContext.SaveChangesAsync();

            Logger.LogInformation(
                $"Użytkownik {userId} odebrał nagrodę {rewardAmount} za misję '{userMission.Mission.Name}'."
            );

            return (true, $"Odebrano nagrodę w wysokości {rewardAmount}!");
        }
    }
}
