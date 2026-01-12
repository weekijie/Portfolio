using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Models;
using Portfolio.Services;

namespace Portfolio.Controllers;

public class HomeController : Controller
{
    private readonly IGitHubService _gitHubService;
    private readonly IProfileService _profileService;
    private readonly ILogger<HomeController> _logger;

    public HomeController(
        IGitHubService gitHubService,
        IProfileService profileService,
        ILogger<HomeController> logger)
    {
        _gitHubService = gitHubService;
        _profileService = profileService;
        _logger = logger;
    }

    public async Task<IActionResult> Index()
    {
        var profileTask = _profileService.GetProfileDataAsync();
        var gitHubProfileTask = _gitHubService.GetProfileAsync();
        var reposTask = _gitHubService.GetRepositoriesAsync();

        await Task.WhenAll(profileTask, gitHubProfileTask, reposTask);

        var viewModel = new PortfolioViewModel
        {
            Profile = await profileTask,
            GitHubProfile = await gitHubProfileTask ?? new GitHubProfile(),
            Repositories = await reposTask
        };

        return View(viewModel);
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
