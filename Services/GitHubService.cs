using Microsoft.Extensions.Caching.Memory;
using Octokit;
using Portfolio.Models;
using Repository = Portfolio.Models.Repository;

namespace Portfolio.Services;

public class GitHubService : IGitHubService
{
    private readonly GitHubClient _client;
    private readonly IMemoryCache _cache;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GitHubService> _logger;
    private readonly string _username;
    private readonly int _cacheDuration;

    public GitHubService(
        IMemoryCache cache,
        IConfiguration configuration,
        ILogger<GitHubService> logger)
    {
        _cache = cache;
        _configuration = configuration;
        _logger = logger;
        _username = configuration["GitHub:Username"] ?? "weekijie";
        _cacheDuration = int.Parse(configuration["Cache:DurationMinutes"] ?? "5");
        
        _client = new GitHubClient(new ProductHeaderValue("Portfolio-Website"));
    }

    public async Task<GitHubProfile?> GetProfileAsync()
    {
        var cacheKey = $"github_profile_{_username}";
        
        if (_cache.TryGetValue(cacheKey, out GitHubProfile? cachedProfile))
        {
            return cachedProfile;
        }

        try
        {
            var user = await _client.User.Get(_username);
            
            var profile = new GitHubProfile
            {
                Login = user.Login,
                Name = user.Name ?? user.Login,
                AvatarUrl = user.AvatarUrl,
                Bio = user.Bio ?? string.Empty,
                Location = user.Location ?? string.Empty,
                HtmlUrl = user.HtmlUrl,
                PublicRepos = user.PublicRepos,
                Followers = user.Followers,
                Following = user.Following
            };

            _cache.Set(cacheKey, profile, TimeSpan.FromMinutes(_cacheDuration));
            return profile;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch GitHub profile for {Username}", _username);
            return null;
        }
    }

    public async Task<List<Repository>> GetRepositoriesAsync()
    {
        var cacheKey = $"github_repos_{_username}";
        
        if (_cache.TryGetValue(cacheKey, out List<Repository>? cachedRepos))
        {
            return cachedRepos ?? new List<Repository>();
        }

        try
        {
            var repos = await _client.Repository.GetAllForUser(_username);
            
            var repositories = repos
                .Where(r => !r.Fork)
                .OrderByDescending(r => r.StargazersCount)
                .ThenByDescending(r => r.UpdatedAt)
                .Take(12)
                .Select(r => new Repository
                {
                    Name = r.Name,
                    Description = r.Description ?? string.Empty,
                    HtmlUrl = r.HtmlUrl,
                    Language = r.Language ?? "Unknown",
                    StargazersCount = r.StargazersCount,
                    ForksCount = r.ForksCount,
                    UpdatedAt = r.UpdatedAt.DateTime,
                    Topics = r.Topics?.ToList() ?? new List<string>()
                })
                .ToList();

            _cache.Set(cacheKey, repositories, TimeSpan.FromMinutes(_cacheDuration));
            return repositories;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch GitHub repositories for {Username}", _username);
            return new List<Repository>();
        }
    }
}
