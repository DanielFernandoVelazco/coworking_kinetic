using AutoMapper;
using KineticWorkspace.API.Mappings.Resolvers;
using KineticWorkspace.API.Models.DTOs.Amenities;
using KineticWorkspace.API.Models.DTOs.Auth;
using KineticWorkspace.API.Models.DTOs.Reservations;
using KineticWorkspace.API.Models.DTOs.Spaces;
using KineticWorkspace.API.Models.DTOs.Users;
using KineticWorkspace.API.Models.Entities;

namespace KineticWorkspace.API.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            ConfigureUserMappings();
            ConfigureSpaceMappings();
            ConfigureReservationMappings();
            ConfigureAmenityMappings();
        }

        // ==================== USER ====================

        private void ConfigureUserMappings()
        {
            CreateMap<User, UserResponseDto>()
                .ForMember(dest => dest.FullName,
                    opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));

            CreateMap<User, UserProfileDto>()
                .ForMember(dest => dest.FullName,
                    opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));

            CreateMap<UserUpdateDto, User>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }

        // ==================== SPACE ====================

        private void ConfigureSpaceMappings()
        {
            CreateMap<Space, SpaceResponseDto>()
                .ForMember(dest => dest.ImageUrls,
                    opt => opt.MapFrom(src => ImageUrlResolver.SplitToList(src.ImageUrls)))
                .ForMember(dest => dest.Amenities,
                    opt => opt.MapFrom(src => AmenityResolver.GetNames(src.Amenities)))
                .ForMember(dest => dest.AmenityIds,
                    opt => opt.MapFrom(src => AmenityResolver.GetIds(src.Amenities)))
                .ForMember(dest => dest.IsActive,
                    opt => opt.MapFrom(src => src.IsActive));

            CreateMap<SpaceRequestDto, Space>()
                .ForMember(dest => dest.Amenities, opt => opt.Ignore())
                .ForMember(dest => dest.ImageUrls, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive,
                    opt => opt.MapFrom(src => src.IsActive));
        }

        // ==================== RESERVATION ====================

        private void ConfigureReservationMappings()
        {
            CreateMap<Reservation, ReservationResponseDto>()
                .ForMember(dest => dest.UserName,
                    opt => opt.MapFrom(src => src.User != null
                        ? $"{src.User.FirstName} {src.User.LastName}"
                        : "Unknown"))
                .ForMember(dest => dest.SpaceName,
                    opt => opt.MapFrom(src => src.Space != null ? src.Space.Name : "Unknown"))
                .ForMember(dest => dest.SpaceType,
                    opt => opt.MapFrom(src => src.Space != null ? src.Space.Type : "Unknown"))
                .ForMember(dest => dest.SpaceImageUrl,
                    opt => opt.MapFrom(src => src.Space != null
                        ? ImageUrlResolver.GetFirst(src.Space.ImageUrls)
                        : null))
                .ForMember(dest => dest.PaidAmount,
                    opt => opt.MapFrom(src => src.Payments != null && src.Payments.Any()
                        ? src.Payments.Sum(p => p.Amount)
                        : (decimal?)null))
                .ForMember(dest => dest.PaymentStatus,
                    opt => opt.MapFrom(src => src.Payments != null && src.Payments.Any()
                        ? src.Payments.First().Status
                        : null));

            CreateMap<ReservationRequestDto, Reservation>();
        }

        // ==================== AMENITY ====================

        private void ConfigureAmenityMappings()
        {
            CreateMap<AmenityRequestDto, Amenity>()
                .ForMember(dest => dest.Spaces, opt => opt.Ignore());

            CreateMap<Amenity, AmenityResponseDto>();
        }
    }
}