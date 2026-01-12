using Portfolio.Models;

namespace Portfolio.Services;

public interface IGitHubService
{
    Task<GitHubProfile?> GetProfileAsync();
    Task<List<Repository>> GetRepositoriesAsync();
}
