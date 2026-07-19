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

if (-not (Test-Path $indexPath)) {
    throw "Missing required file: $indexPath. Ensure site/index.html exists."
}
$indexContent = [System.IO.File]::ReadAllText($indexPath)
$indexContent = $indexContent.Replace("{{SITE_URL}}", $SiteUrl.TrimEnd("/"))
[System.IO.File]::WriteAllText($indexPath, $indexContent, [System.Text.Encoding]::UTF8)

if (-not (Test-Path $manifestPath)) {
    throw "Missing required file: $manifestPath. Ensure site/manifest.json exists."
}
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
            @{ Expression = { [System.DateTime]::Parse($_.updated_at, [System.Globalization.CultureInfo]::InvariantCulture, [System.Globalization.DateTimeStyles]::RoundtripKind) }; Descending = $true }
        ) |
        Select-Object -First 12 |
        ForEach-Object {
            $description = if ($_.description) { $_.description } else { "" }
            if ($_.name -eq "Lenz") {
                $description = "$description — Gemini 3 Hackathon submission"
            }
            elseif ($_.name -eq "Sturgeon") {
                $description = "$description — MedGemma Impact Challenge (Kaggle)"
            }

            [ordered]@{
                name = $_.name
                description = $description
                htmlUrl = $_.html_url
                homepageUrl = if ($_.homepage) { $_.homepage } else { "" }
                language = if ($_.language) { $_.language } else { "Unknown" }
                stargazersCount = [int]$_.stargazers_count
                forksCount = [int]$_.forks_count
                updatedAt = ([System.DateTime]::Parse($_.updated_at, [System.Globalization.CultureInfo]::InvariantCulture, [System.Globalization.DateTimeStyles]::RoundtripKind)).ToString("o")
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
