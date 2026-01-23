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
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.ConcreteServices
{
    /// <summary>
    /// Serwis zarządzający systemem misji i wyzwań dla użytkowników.
    /// Typy misji: MakeSpins (wykonaj spiny), WinInARow (wygraj pod rząd),
    /// WinTotalAmount (wygraj łącznie X), PlayGames (zagraj we wszystkie gry), MakeDeposits (dokonaj wpłat).
    /// Śledzi postęp, oznacza ukończone misje i obsługuje odbieranie nagród.
    /// </summary>
    public class MissionService : BaseService, IMissionService
    {
        public MissionService(
            ApplicationDbContext dbContext,
            IMapper mapper,
            ILogger<MissionService> logger
        )
            : base(dbContext, mapper, logger) { }

        public async Task<IEnumerable<UserMissionVm>> GetUserMissionsAsync(string userId)
        {
            if (!int.TryParse(userId, out int parsedUserId))
            {
                return new List<UserMissionVm>();
            }

            var allMissions = await DbContext.Missions.ToListAsync();

            var userMissions = await DbContext
                .UserMissions.Where(um => um.UserId == parsedUserId)
                .Include(um => um.Mission)
                .ToListAsync();

            var result = Mapper.Map<List<UserMissionVm>>(userMissions);

            var startedMissionIds = userMissions.Select(um => um.MissionId).ToHashSet();
            var unstartedMissions = allMissions.Where(m => !startedMissionIds.Contains(m.Id));

            result.AddRange(Mapper.Map<IEnumerable<UserMissionVm>>(unstartedMissions));

            return result;
        }

        public async Task UpdateMakeSpinsProgressAsync(string userId)
        {
            if (!int.TryParse(userId, out int parsedUserId))
            {
                return;
            }

            var mission = await DbContext.Missions.FirstOrDefaultAsync(m =>
                m.MissionType == MissionType.MakeSpins
            );
            if (mission == null)
            {
                return;
            }

            var userMission = await DbContext
                .UserMissions.Include(um => um.Mission)
                .FirstOrDefaultAsync(um => um.UserId == parsedUserId && um.MissionId == mission.Id);

            if (userMission == null)
            {
                userMission = new UserMission
                {
                    UserId = parsedUserId,
                    MissionId = mission.Id,
                    Mission = mission,
                    CurrentProgress = 0,
                    IsCompleted = false,
                    IsClaimed = false,
                };
                DbContext.UserMissions.Add(userMission);
            }

            if (userMission.IsCompleted)
            {
                return;
            }

            userMission.CurrentProgress += 1;

            if (userMission.CurrentProgress >= userMission.Mission.RequiredAmount)
            {
                userMission.CurrentProgress = userMission.Mission.RequiredAmount;
                userMission.IsCompleted = true;
            }

            await DbContext.SaveChangesAsync();
        }

        public async Task UpdateWinInARowProgressAsync(string userId, bool isWin)
        {
            if (!int.TryParse(userId, out int parsedUserId))
            {
                return;
            }

            var mission = await DbContext.Missions.FirstOrDefaultAsync(m =>
                m.MissionType == MissionType.WinInARow
            );
            if (mission == null)
            {
                return;
            }

            var userMission = await DbContext
                .UserMissions.Include(um => um.Mission)
                .FirstOrDefaultAsync(um => um.UserId == parsedUserId && um.MissionId == mission.Id);

            if (userMission == null)
            {
                userMission = new UserMission
                {
                    UserId = parsedUserId,
                    MissionId = mission.Id,
                    Mission = mission,
                    CurrentProgress = 0,
                    IsCompleted = false,
                    IsClaimed = false,
                };
                DbContext.UserMissions.Add(userMission);
            }

            if (userMission.IsCompleted)
            {
                return;
            }

            if (isWin)
            {
                userMission.CurrentProgress++;
            }
            else
            {
                userMission.CurrentProgress = 0;
            }

            if (userMission.CurrentProgress >= userMission.Mission.RequiredAmount)
            {
                userMission.CurrentProgress = userMission.Mission.RequiredAmount;
                userMission.IsCompleted = true;
            }

            await DbContext.SaveChangesAsync();
        }

        public async Task<bool> ClaimMissionRewardAsync(string userId, int missionId)
        {
            if (!int.TryParse(userId, out int parsedUserId))
            {
                return false;
            }

            var userMission = await DbContext
                .UserMissions.Include(um => um.Mission)
                .FirstOrDefaultAsync(um => um.UserId == parsedUserId && um.MissionId == missionId);

            if (userMission == null || !userMission.IsCompleted || userMission.IsClaimed)
            {
                return false;
            }

            var user = await DbContext.Users.FindAsync(parsedUserId);
            if (user == null)
            {
                return false;
            }

            user.Balance += userMission.Mission.RewardAmount;
            userMission.IsClaimed = true;

            var payment = new Payment
            {
                Amount = userMission.Mission.RewardAmount,
                CreatedAt = DateTime.UtcNow,
                TransactionType = TransactionType.Bonus,
                UserId = parsedUserId,
            };

            DbContext.Payments.Add(payment);
            await DbContext.SaveChangesAsync();
            return true;
        }

        public async Task UpdateAllGamesPlayedProgressAsync(string userId, int gameId)
        {
            if (!int.TryParse(userId, out int parsedUserId))
            {
                return;
            }

            var alreadyPlayed = await DbContext.UserPlayedGames.AnyAsync(upg =>
                upg.UserId == parsedUserId && upg.GameId == gameId
            );

            if (alreadyPlayed)
            {
                return;
            }

            var newUserPlayedGame = new UserPlayedGame { UserId = parsedUserId, GameId = gameId };
            DbContext.UserPlayedGames.Add(newUserPlayedGame);

            var mission = await DbContext.Missions.FirstOrDefaultAsync(m =>
                m.MissionType == MissionType.PlayGames
            );
            if (mission == null)
            {
                return;
            }

            var userMission = await DbContext
                .UserMissions.Include(um => um.Mission)
                .FirstOrDefaultAsync(um => um.UserId == parsedUserId && um.MissionId == mission.Id);

            if (userMission == null)
            {
                userMission = new UserMission
                {
                    UserId = parsedUserId,
                    MissionId = mission.Id,
                    Mission = mission,
                    CurrentProgress = 0,
                    IsCompleted = false,
                    IsClaimed = false,
                };
                DbContext.UserMissions.Add(userMission);
            }

            if (userMission.IsCompleted)
            {
                return;
            }

            userMission.CurrentProgress++;

            if (userMission.CurrentProgress >= userMission.Mission.RequiredAmount)
            {
                userMission.CurrentProgress = userMission.Mission.RequiredAmount;
                userMission.IsCompleted = true;
            }

            await DbContext.SaveChangesAsync();
        }

        public async Task UpdateWinTotalAmountProgressAsync(string userId, decimal winAmount)
        {
            if (!int.TryParse(userId, out int parsedUserId) || winAmount <= 0)
            {
                return;
            }

            var mission = await DbContext.Missions.FirstOrDefaultAsync(m =>
                m.MissionType == MissionType.WinTotalAmount
            );
            if (mission == null)
            {
                return;
            }

            var userMission = await DbContext
                .UserMissions.Include(um => um.Mission)
                .FirstOrDefaultAsync(um => um.UserId == parsedUserId && um.MissionId == mission.Id);

            if (userMission == null)
            {
                userMission = new UserMission
                {
                    UserId = parsedUserId,
                    MissionId = mission.Id,
                    Mission = mission,
                    CurrentProgress = 0,
                    IsCompleted = false,
                    IsClaimed = false,
                };
                DbContext.UserMissions.Add(userMission);
            }

            if (userMission.IsCompleted)
            {
                return;
            }

            userMission.CurrentProgress += winAmount;

            if (userMission.CurrentProgress >= userMission.Mission.RequiredAmount)
            {
                userMission.CurrentProgress = userMission.Mission.RequiredAmount;
                userMission.IsCompleted = true;
            }

            await DbContext.SaveChangesAsync();
        }

        public async Task UpdateMakeDepositsProgressAsync(string userId)
        {
            if (!int.TryParse(userId, out int parsedUserId))
            {
                return;
            }

            var mission = await DbContext.Missions.FirstOrDefaultAsync(m =>
                m.MissionType == MissionType.DepositCount
            );
            if (mission == null)
            {
                return;
            }

            var userMission = await DbContext
                .UserMissions.Include(um => um.Mission)
                .FirstOrDefaultAsync(um => um.UserId == parsedUserId && um.MissionId == mission.Id);

            if (userMission == null)
            {
                userMission = new UserMission
                {
                    UserId = parsedUserId,
                    MissionId = mission.Id,
                    Mission = mission,
                    CurrentProgress = 0,
                    IsCompleted = false,
                    IsClaimed = false,
                };
                DbContext.UserMissions.Add(userMission);
            }

            if (userMission.IsCompleted)
            {
                return;
            }

            userMission.CurrentProgress += 1;

            if (userMission.CurrentProgress >= userMission.Mission.RequiredAmount)
            {
                userMission.CurrentProgress = userMission.Mission.RequiredAmount;
                userMission.IsCompleted = true;
            }

            await DbContext.SaveChangesAsync();
        }
    }
}
