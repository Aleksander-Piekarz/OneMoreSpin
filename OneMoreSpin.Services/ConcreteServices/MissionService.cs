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

            // 1. Pobierz wszystkie możliwe misje
            var allMissions = await DbContext.Missions.ToListAsync();

            // 2. Pobierz misje, które użytkownik już rozpoczął
            var userMissions = await DbContext
                .UserMissions.Where(um => um.UserId == parsedUserId)
                .Include(um => um.Mission) // Dołącz dane z tabeli Mission
                .ToListAsync();

            // 3. Użyj AutoMappera do zmapowania rozpoczętych misji na ViewModel
            var result = Mapper.Map<List<UserMissionVm>>(userMissions);

            // 4. Znajdź misje, których użytkownik jeszcze nie zaczął
            var startedMissionIds = userMissions.Select(um => um.MissionId).ToHashSet();
            var unstartedMissions = allMissions.Where(m => !startedMissionIds.Contains(m.Id));

            // Zamiast pętli, użyj mapowania na całej kolekcji
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

            Logger.LogInformation(
                $"Użytkownik {userId} odebrał nagrodę {userMission.Mission.RewardAmount} za misję '{userMission.Mission.Name}'."
            );

            return true;
        }

        public async Task UpdateAllGamesPlayedProgressAsync(string userId, int gameId)
        {
            if (!int.TryParse(userId, out int parsedUserId))
            {
                return;
            }

            // 1. Sprawdź, czy użytkownik już zagrał w tę grę
            var alreadyPlayed = await DbContext.UserPlayedGames.AnyAsync(upg =>
                upg.UserId == parsedUserId && upg.GameId == gameId
            );

            if (alreadyPlayed)
            {
                return; // Użytkownik już grał w tę grę, nic nie rób
            }

            // 2. Zapisz, że użytkownik zagrał w tę grę
            var newUserPlayedGame = new UserPlayedGame { UserId = parsedUserId, GameId = gameId };
            DbContext.UserPlayedGames.Add(newUserPlayedGame);

            // 3. Znajdź misję "PlayGames"
            var mission = await DbContext.Missions.FirstOrDefaultAsync(m =>
                m.MissionType == MissionType.PlayGames
            );
            if (mission == null)
            {
                return; // Misja nie istnieje
            }

            // 4. Znajdź lub utwórz UserMission dla tej misji
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

            // 5. Zaktualizuj postęp
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
