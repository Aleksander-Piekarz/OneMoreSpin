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
    public class PaymentService : BaseService, IPaymentService
    {
        public PaymentService(
            ApplicationDbContext dbContext,
            IMapper mapper,
            ILogger<PaymentService> logger
        )
            : base(dbContext, mapper, logger) { }

        public async Task<List<PaymentHistoryItemVm>> GetPaymentHistoryAsync(string userId)
        {

            if (!int.TryParse(userId, out int parsedUserId))
            {
                // Możesz tu rzucić wyjątek lub zwrócić pustą listę
                return new List<PaymentHistoryItemVm>(); 
            }

            
            var payments = await DbContext
                .Payments.Where(p => p.UserId == parsedUserId) // <-- ZMIANA TUTAJ
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Mapper.Map<List<PaymentHistoryItemVm>>(payments);
        }
        public async Task<User> CreateDepositAsync(string userId, decimal amount)
        {
            if (amount <= 0)
            {
                throw new ArgumentException("Kwota wpłaty musi być dodatnia.", nameof(amount));
            }
            if (!int.TryParse(userId, out int parsedUserId))
            {
                throw new ArgumentException("Nieprawidłowy format ID użytkownika dla depozytu.", nameof(userId));
            }

            // --- Początek transakcji ---
            await using var transaction = await DbContext.Database.BeginTransactionAsync();

            try
            {
                // Blokada wiersza użytkownika w celu uniknięcia race conditions
                var user = await DbContext.Users
                    .Where(u => u.Id == parsedUserId)
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    throw new KeyNotFoundException($"Nie znaleziono użytkownika o ID: {parsedUserId}");
                }

                // Aktualizacja salda
                user.Balance += amount;
                DbContext.Users.Update(user); // Jawne oznaczenie encji jako zmodyfikowanej

                // Utworzenie rekordu płatności
                var payment = new Payment
                {
                    Amount = amount,
                    CreatedAt = DateTime.UtcNow,
                    TransactionType = TransactionType.Deposit,
                    UserId = user.Id
                };

                await DbContext.Payments.AddAsync(payment);
                await DbContext.SaveChangesAsync();

                // Zatwierdzenie transakcji
                await transaction.CommitAsync();

                Logger.LogInformation($"Użytkownik {userId} pomyślnie wpłacił {amount}. Nowe saldo: {user.Balance}");

                return user;
            }
            catch (Exception ex)
            {
                // Wycofanie transakcji w przypadku błędu
                await transaction.RollbackAsync();
                Logger.LogError(ex, $"Błąd podczas tworzenia depozytu dla użytkownika {userId}. Transakcja wycofana.");
                throw; // Rzuć wyjątek dalej, aby kontroler mógł go obsłużyć
            }
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
                    Amount = -amount, // Ujemna kwota dla wypłaty
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
