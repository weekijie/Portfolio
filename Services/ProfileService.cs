using System.Text.Json;
using Portfolio.Models;

namespace Portfolio.Services;

public class ProfileService : IProfileService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ProfileService> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public ProfileService(IWebHostEnvironment environment, ILogger<ProfileService> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public async Task<ProfileData> GetProfileDataAsync()
    {
        var profilePath = Path.Combine(_environment.ContentRootPath, "Data", "profile.json");
        
        try
        {
            if (File.Exists(profilePath))
            {
                var json = await File.ReadAllTextAsync(profilePath);
                return JsonSerializer.Deserialize<ProfileData>(json, JsonOptions) ?? new ProfileData();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load profile data from {Path}", profilePath);
        }

        return new ProfileData();
    }
}
