using Portfolio.Models;

namespace Portfolio.Services;

public interface IProfileService
{
    Task<ProfileData> GetProfileDataAsync();
}
