using AutoMapper;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.Configuration.AutoMapperProfiles;

public class MainProfile : Profile
{
    public MainProfile()
    {
        CreateMap<User, UserProfileVm>();
        CreateMap<Payment, PaymentHistoryItemVm>()
            .ForMember(d => d.TransactionType, o => o.MapFrom(s => s.TransactionType.ToString()));
        CreateMap<UserScore, GameHistoryItemVm>()
            .ForMember(d => d.GameName, o => o.MapFrom(s => s.Game.Name))
            .ForMember(d => d.PlayedAt, o => o.MapFrom(s => System.DateTime.Now));
        CreateMap<UserMission, UserMissionVm>()
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Mission.Name))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Mission.Description))
            .ForMember(
                dest => dest.RequiredAmount,
                opt => opt.MapFrom(src => src.Mission.RequiredAmount)
            )
            .ForMember(
                dest => dest.RewardAmount,
                opt => opt.MapFrom(src => src.Mission.RewardAmount)
            );
        CreateMap<Mission, UserMissionVm>()
            .ForMember(dest => dest.MissionId, opt => opt.MapFrom(src => src.Id));
    }
}
