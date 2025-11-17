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

            
            
            
           var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Id == parsedUserId); 
            if (user == null)
            {
                throw new KeyNotFoundException($"Nie znaleziono użytkownika o ID: {parsedUserId}");
            }

            
            
            user.Balance += amount;

            
            var payment = new Payment
            {
                Amount = amount,
                CreatedAt = DateTime.UtcNow,
                
                TransactionType = TransactionType.Deposit, 
                UserId = user.Id
            };

            await DbContext.Payments.AddAsync(payment);
            await DbContext.SaveChangesAsync();

            Logger.LogInformation($"Użytkownik {userId} pomyślnie wpłacił {amount}. Nowe saldo: {user.Balance}");

            return user; 
        }
    }
}
