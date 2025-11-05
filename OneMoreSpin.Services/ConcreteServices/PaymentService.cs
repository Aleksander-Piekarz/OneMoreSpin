using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OneMoreSpin.DAL.EF;
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
            var payments = await DbContext
                .Payments.Where(p => p.UserId.ToString() == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Mapper.Map<List<PaymentHistoryItemVm>>(payments);
        }
    }
}
