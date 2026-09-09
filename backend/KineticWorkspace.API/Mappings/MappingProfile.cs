using AutoMapper;
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
            // ==================== AUTH MAPPINGS ====================
            CreateMap<User, UserResponseDto>()
                .ForMember(dest => dest.FullName,
                    opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));

            CreateMap<User, UserProfileDto>()
                .ForMember(dest => dest.FullName,
                    opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));

            // ==================== SPACE MAPPINGS ====================
            CreateMap<Space, SpaceResponseDto>()
                .ForMember(dest => dest.Amenities,
                    opt => opt.MapFrom(src => src.Amenities.Select(a => a.Name).ToList()))
                .ForMember(dest => dest.ImageUrls, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.AmenityIds,
                    opt => opt.MapFrom(src => src.Amenities.Select(a => a.Id).ToList()))
                .AfterMap((src, dest) =>
                {
                    dest.ImageUrls = string.IsNullOrEmpty(src.ImageUrls)
                        ? new List<string>()
                        : src.ImageUrls.Split(',').ToList();
                });

            CreateMap<SpaceRequestDto, Space>()
                .ForMember(dest => dest.Amenities, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .AfterMap((src, dest) =>
                {
                    dest.ImageUrls = src.ImageUrls != null && src.ImageUrls.Any()
                        ? string.Join(",", src.ImageUrls)
                        : null;
                });

            // ==================== RESERVATION MAPPINGS ====================
            CreateMap<Reservation, ReservationResponseDto>()
                .ForMember(dest => dest.UserName,
                    opt => opt.MapFrom(src => src.User != null ? $"{src.User.FirstName} {src.User.LastName}" : "Unknown"))
                .ForMember(dest => dest.SpaceName,
                    opt => opt.MapFrom(src => src.Space != null ? src.Space.Name : "Unknown"))
                .ForMember(dest => dest.SpaceType,
                    opt => opt.MapFrom(src => src.Space != null ? src.Space.Type : "Unknown"))
                .ForMember(dest => dest.SpaceImageUrl, opt => opt.Ignore())
                .ForMember(dest => dest.PaidAmount,
                    opt => opt.MapFrom(src => src.Payments != null && src.Payments.Any()
                        ? src.Payments.Sum(p => p.Amount)
                        : (decimal?)null))
                .ForMember(dest => dest.PaymentStatus,
                    opt => opt.MapFrom(src => src.Payments != null && src.Payments.Any()
                        ? src.Payments.First().Status
                        : null))
                .AfterMap((src, dest) =>
                {
                    // ✅ MANEJO DE NULL PARA EVITAR EXCEPCIONES
                    if (src.Space != null && !string.IsNullOrEmpty(src.Space.ImageUrls))
                    {
                        dest.SpaceImageUrl = src.Space.ImageUrls.Split(',').FirstOrDefault();
                    }
                    else
                    {
                        dest.SpaceImageUrl = null;
                    }
                });

            CreateMap<ReservationRequestDto, Reservation>();

            // ==================== USER MAPPINGS ====================
            CreateMap<UserUpdateDto, User>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // ==================== AMENITY MAPPINGS ====================
            CreateMap<AmenityRequestDto, Amenity>()
                .ForMember(dest => dest.Spaces, opt => opt.Ignore());

            CreateMap<Amenity, AmenityResponseDto>();
        }
    }
}