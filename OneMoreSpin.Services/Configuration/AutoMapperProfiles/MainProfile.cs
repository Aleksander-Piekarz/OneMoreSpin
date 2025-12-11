using AutoMapper;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.Configuration.AutoMapperProfiles;

public class MainProfile : Profile
{
    public MainProfile()
    {
        CreateMap<User, UserProfileVm>();
        CreateMap<Card, CardVm>()
            .ForMember(d => d.Rank, o => o.MapFrom(s => s.Rank.ToString()))
            .ForMember(d => d.Suit, o => o.MapFrom(s => s.Suit.ToString()));
        CreateMap<PokerGameSession, PokerGameSessionVm>()
            .ForMember(
                d => d.PlayerHandRank,
                o =>
                    o.MapFrom(s =>
                        s.EvaluatedPlayerHand != null
                            ? (
                                string.IsNullOrEmpty(s.EvaluatedPlayerHand.RankDescription)
                                    ? s.EvaluatedPlayerHand.Rank.ToString()
                                    : s.EvaluatedPlayerHand.RankDescription
                            )
                            : string.Empty
                    )
            )
            .ForMember(
                d => d.DealerHandRank,
                o =>
                    o.MapFrom(s =>
                        s.EvaluatedDealerHand != null
                            ? (
                                string.IsNullOrEmpty(s.EvaluatedDealerHand.RankDescription)
                                    ? s.EvaluatedDealerHand.Rank.ToString()
                                    : s.EvaluatedDealerHand.RankDescription
                            )
                            : string.Empty
                    )
            );

        CreateMap<Payment, PaymentHistoryItemVm>()
            .ForMember(d => d.TransactionType, o => o.MapFrom(s => s.TransactionType.ToString()));
        CreateMap<UserScore, GameHistoryItemVm>()
            .ForMember(d => d.GameName, o => o.MapFrom(s => s.Game.Name))
            .ForMember(d => d.Outcome, o => o.MapFrom(s => s.Score))
            .ForMember(d => d.Stake, o => o.MapFrom(s => s.Stake))
            .ForMember(d => d.MoneyWon, o => o.MapFrom(s => s.MoneyWon));
        CreateMap<UserMission, UserMissionVm>()
            .ForMember(dest => dest.MissionId, opt => opt.MapFrom(src => src.MissionId))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Mission.Name))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Mission.Description))
            .ForMember(dest => dest.CurrentProgress, opt => opt.MapFrom(src => src.CurrentProgress))
            .ForMember(
                dest => dest.RequiredAmount,
                opt => opt.MapFrom(src => src.Mission.RequiredAmount)
            )
            .ForMember(
                dest => dest.RewardAmount,
                opt => opt.MapFrom(src => src.Mission.RewardAmount)
            )
            .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => src.IsCompleted))
            .ForMember(dest => dest.IsClaimed, opt => opt.MapFrom(src => src.IsClaimed));
        CreateMap<Mission, UserMissionVm>()
            .ForMember(dest => dest.MissionId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.CurrentProgress, opt => opt.MapFrom(src => 0))
            .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.IsClaimed, opt => opt.MapFrom(src => false));
    }
}
