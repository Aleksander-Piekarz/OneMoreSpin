using AutoMapper;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.Configuration.AutoMapperProfiles;

public class MainProfile : Profile
{
    public MainProfile()
    {
        CreateMap<User, UserProfileVm>();
        CreateMap<Payment, PaymentHistoryItemVm>();
    }
}
