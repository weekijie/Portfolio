namespace Portfolio.Models;

public class PortfolioViewModel
{
    public ProfileData Profile { get; set; } = new();
    public GitHubProfile GitHubProfile { get; set; } = new();
    public List<Repository> Repositories { get; set; } = new();
    public string ActiveTab { get; set; } = "work";
}
