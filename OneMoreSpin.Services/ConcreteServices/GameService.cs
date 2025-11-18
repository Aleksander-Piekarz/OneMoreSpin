using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OneMoreSpin.DAL.EF;
using OneMoreSpin.Services.Interfaces;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.ConcreteServices
{
    public class GameService : BaseService, IGameService
    {
        public GameService(
            ApplicationDbContext dbContext,
            IMapper _mapper,
            ILogger<GameService> logger
        )
            : base(dbContext, _mapper, logger) { }

        public async Task<List<GameHistoryItemVm>> GetGameHistoryAsync(string userId)
        {
            if (!int.TryParse(userId, out int parsedUserId))
            {
                return new List<GameHistoryItemVm>();
            }

            var items = await DbContext
                .UserScores.Include(us => us.Game)
                .Where(us => us.UserId == parsedUserId)
                .OrderByDescending(us => us.Id)
                .ToListAsync();

           return Mapper.Map<List<GameHistoryItemVm>>(items);
        }
    }
}
