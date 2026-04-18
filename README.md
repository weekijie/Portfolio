# Portfolio Website

Personal portfolio site for Wee Ki Jie, now built as a static GitHub Pages site.

## Stack

- HTML, CSS, vanilla JavaScript
- JSON content files in `site/data/`
- GitHub Pages for hosting
- GitHub Actions for build + deploy
- EmailJS for contact form delivery

## Content Model

Main editable content lives in `site/data/profile.json`.

- Bio, contact details, resume link
- Experience and education
- Certifications and competitions
- Skills

Featured repositories are generated at build time into `data/repos.json`.
Browser-side config is generated at build time into `data/site-config.json`.

## Local Build

Build static output into `dist/`:

```powershell
pwsh ./scripts/build-pages.ps1
```

Preview with any static file server from `dist/`.

## GitHub Pages Deploy

Workflow file: `.github/workflows/deploy-pages.yml`

On push to `main`, GitHub Actions:

1. Copies static source from `site/`
2. Fetches public repositories from GitHub
3. Generates `data/site-config.json`
4. Publishes `dist/` to GitHub Pages

Target URL:

- `https://weekijie.github.io/Portfolio/`

## Legacy Snapshot

The old ASP.NET Core / Railway version is preserved separately:

- branch: `pre-pages-migration`
- tag: `aspnet-final`

## Required Secrets

Optional EmailJS secrets for contact form:

- `EMAILJS_PUBLIC_KEY`
- `EMAILJS_SERVICE_ID`
- `EMAILJS_TEMPLATE_ID`

If secrets are missing, contact form stays visible and shows a configuration warning on submit.

## Project Layout

```text
site/
  index.html
  css/
  js/
  data/
  documents/
scripts/
  build-pages.ps1
.github/workflows/
  deploy-pages.yml
```

The legacy branch exists for backup and reference only. Active development now happens on the GitHub Pages implementation in `main`.
