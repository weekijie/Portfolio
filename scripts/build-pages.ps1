param(
    [string]$SourceDir = "site",
    [string]$OutputDir = "dist",
    [string]$GitHubUsername = "weekijie",
    [string]$SiteUrl = ""
)

$ErrorActionPreference = "Stop"

function Get-AbsolutePath([string]$PathValue) {
    return [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $PathValue))
}

function Assert-PathInsideWorkspace([string]$TargetPath, [string]$WorkspacePath) {
    $target = [System.IO.Path]::GetFullPath($TargetPath)
    $workspace = [System.IO.Path]::GetFullPath($WorkspacePath)
    if (-not $target.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to modify path outside workspace: $TargetPath"
    }
}

function Write-JsonFile([string]$PathValue, $ObjectValue) {
    $json = $ObjectValue | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($PathValue, $json + "`n", [System.Text.Encoding]::UTF8)
}

if ([string]::IsNullOrWhiteSpace($SiteUrl)) {
    $SiteUrl = if ($env:SITE_URL) { $env:SITE_URL } else { "https://weekijie.github.io/Portfolio" }
}

$sourcePath = Get-AbsolutePath $SourceDir
$outputPath = Get-AbsolutePath $OutputDir
$workspacePath = Get-Location

Assert-PathInsideWorkspace -TargetPath $sourcePath -WorkspacePath $workspacePath
Assert-PathInsideWorkspace -TargetPath $outputPath -WorkspacePath $workspacePath

if (-not (Test-Path $sourcePath)) {
    throw "Source directory not found: $sourcePath"
}

if (Test-Path $outputPath) {
    Remove-Item -LiteralPath $outputPath -Recurse -Force
}

New-Item -ItemType Directory -Path $outputPath | Out-Null

Get-ChildItem -LiteralPath $sourcePath -Force | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $outputPath -Recurse -Force
}

$siteUri = [System.Uri]$SiteUrl
$startUrl = $siteUri.AbsolutePath
if ([string]::IsNullOrWhiteSpace($startUrl)) {
    $startUrl = "/"
}
if (-not $startUrl.EndsWith("/")) {
    $startUrl += "/"
}

$indexPath = Join-Path $outputPath "index.html"
$manifestPath = Join-Path $outputPath "manifest.json"

$indexContent = [System.IO.File]::ReadAllText($indexPath)
$indexContent = $indexContent.Replace("{{SITE_URL}}", $SiteUrl.TrimEnd("/"))
[System.IO.File]::WriteAllText($indexPath, $indexContent, [System.Text.Encoding]::UTF8)

$manifestContent = [System.IO.File]::ReadAllText($manifestPath)
$manifestContent = $manifestContent.Replace("{{START_URL}}", $startUrl)
[System.IO.File]::WriteAllText($manifestPath, $manifestContent, [System.Text.Encoding]::UTF8)

$reposTargetPath = Join-Path $outputPath "data\repos.json"
$headers = @{
    "User-Agent" = "Portfolio-Pages-Build"
    "Accept" = "application/vnd.github+json"
}

try {
    $repoApiUrl = "https://api.github.com/users/$GitHubUsername/repos?per_page=100&sort=updated"
    $repoResponse = Invoke-RestMethod -Uri $repoApiUrl -Headers $headers
    $repoSnapshot = $repoResponse |
        Where-Object { -not $_.fork -and $_.name -ne "Portfolio" } |
        Sort-Object -Property @(
            @{ Expression = { [int]$_.stargazers_count }; Descending = $true },
            @{ Expression = { [datetime]$_.updated_at }; Descending = $true }
        ) |
        Select-Object -First 12 |
        ForEach-Object {
            [ordered]@{
                name = $_.name
                description = switch ($_.name) {
                    "Lenz" { "$(if ($_.description) { $_.description } else { "" }) Gemini 3 Hackathon submission"; break }
                    "Sturgeon" { "$(if ($_.description) { $_.description } else { "" }) MedGemma Impact Challenge (Kaggle)"; break }
                    default { if ($_.description) { $_.description } else { "" } }
                }
                htmlUrl = $_.html_url
                homepageUrl = if ($_.homepage) { $_.homepage } else { "" }
                language = if ($_.language) { $_.language } else { "Unknown" }
                stargazersCount = [int]$_.stargazers_count
                forksCount = [int]$_.forks_count
                updatedAt = ([datetime]$_.updated_at).ToString("o")
                topics = @($_.topics)
            }
        }

    Write-JsonFile -PathValue $reposTargetPath -ObjectValue @($repoSnapshot)
    Write-Host "Fetched $($repoSnapshot.Count) repositories from GitHub."
}
catch {
    Write-Warning "GitHub fetch failed. Keeping fallback snapshot from source data/repos.json. $($_.Exception.Message)"
}

$siteConfig = [ordered]@{
    emailJs = [ordered]@{
        publicKey = if ($env:EMAILJS_PUBLIC_KEY) { $env:EMAILJS_PUBLIC_KEY } else { "" }
        serviceId = if ($env:EMAILJS_SERVICE_ID) { $env:EMAILJS_SERVICE_ID } else { "" }
        templateId = if ($env:EMAILJS_TEMPLATE_ID) { $env:EMAILJS_TEMPLATE_ID } else { "" }
    }
    siteUrl = $SiteUrl.TrimEnd("/")
}

$siteConfigPath = Join-Path $outputPath "data\site-config.json"
Write-JsonFile -PathValue $siteConfigPath -ObjectValue $siteConfig

Write-Host "Static site built at $outputPath"
