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
    /// Serwis obsługujący transakcje finansowe użytkowników.
    /// Obsługuje wpłaty (Deposit), wypłaty (Withdrawal) i bonusy.
    /// Wszystkie operacje są wykonywane w transakcjach bazodanowych dla bezpieczeństwa.
    /// Rejestruje historię płatności i aktualizuje saldo użytkownika.
    /// </summary>
    public class PaymentService : BaseService, IPaymentService
    {
        private readonly IMissionService _missionService;

        public PaymentService(
            IMissionService missionService,
            ApplicationDbContext dbContext,
            IMapper mapper,
            ILogger<PaymentService> logger
        )
            : base(dbContext, mapper, logger) {
            _missionService = missionService;
        }

        public async Task<List<PaymentHistoryItemVm>> GetPaymentHistoryAsync(string userId)
        {

            if (!int.TryParse(userId, out int parsedUserId))
            {
                return new List<PaymentHistoryItemVm>(); 
            }

            
            var payments = await DbContext
                .Payments.Where(p => p.UserId == parsedUserId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Mapper.Map<List<PaymentHistoryItemVm>>(payments);
        }
        public async Task<User> CreateDepositAsync(string userId, decimal amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Kwota wpłaty musi być dodatnia.", nameof(amount));
            if (!int.TryParse(userId, out int parsedUserId))
                throw new ArgumentException("Nieprawidłowy format ID użytkownika dla depozytu.", nameof(userId));

            User user;
            await using var transaction = await DbContext.Database.BeginTransactionAsync();
            try
            {
                user = await DbContext.Users
                    .Where(u => u.Id == parsedUserId)
                    .FirstOrDefaultAsync();

                if (user == null)
                    throw new KeyNotFoundException($"Nie znaleziono użytkownika o ID: {parsedUserId}");

                user.Balance += amount;
                DbContext.Users.Update(user);

                var payment = new Payment
                {
                    Amount = amount,
                    CreatedAt = DateTime.UtcNow,
                    TransactionType = TransactionType.Deposit,
                    UserId = user.Id
                };

                await DbContext.Payments.AddAsync(payment);
                await DbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                Logger.LogInformation($"Użytkownik {userId} pomyślnie wpłacił {amount}. Nowe saldo: {user.Balance}");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Logger.LogError(ex, $"Błąd podczas tworzenia depozytu dla użytkownika {userId}. Transakcja wycofana.");
                throw;
            }

            await _missionService.UpdateMakeDepositsProgressAsync(userId);

            return user;
        }

        public async Task<User> CreateWithdrawalAsync(string userId, decimal amount)
        {
            if (amount <= 0)
            {
                throw new ArgumentException("Kwota wypłaty musi być dodatnia.", nameof(amount));
            }
            if (!int.TryParse(userId, out int parsedUserId))
            {
                throw new ArgumentException("Nieprawidłowy format ID użytkownika dla wypłaty.", nameof(userId));
            }

            await using var transaction = await DbContext.Database.BeginTransactionAsync();

            try
            {
                var user = await DbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == parsedUserId);

                if (user == null)
                {
                    throw new KeyNotFoundException($"Nie znaleziono użytkownika o ID: {parsedUserId}");
                }

                if (user.Balance < amount)
                {
                    throw new InvalidOperationException("Niewystarczające środki na koncie.");
                }

                user.Balance -= amount;
                DbContext.Users.Update(user);

                var payment = new Payment
                {
                    Amount = -amount,
                    CreatedAt = DateTime.UtcNow,
                    TransactionType = TransactionType.Withdrawal,
                    UserId = user.Id
                };

                await DbContext.Payments.AddAsync(payment);
                await DbContext.SaveChangesAsync();

                await transaction.CommitAsync();

                Logger.LogInformation($"Użytkownik {userId} pomyślnie wypłacił {amount}. Nowe saldo: {user.Balance}");
                
                return user;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Logger.LogError(ex, $"Błąd podczas tworzenia wypłaty dla użytkownika {userId}. Transakcja wycofana.");
                throw;
            }
        }
    }
}
