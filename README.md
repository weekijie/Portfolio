# Portfolio Website

## Legacy Snapshot

This branch preserves the pre-GitHub-Pages ASP.NET Core / Railway version of the portfolio.

- Active site and ongoing development now live on `main`
- Permanent backup tag for this version: `aspnet-final`

A personal portfolio website built with **ASP.NET Core MVC** (.NET 10). Features a modern, responsive design with dark/light theme support.

**Live Demo**: [weekijie.up.railway.app](https://weekijie.up.railway.app)

## Features

- **Dynamic Content** - Profile data managed via `Data/profile.json`
- **GitHub Integration** - Auto-fetches repositories and profile stats
- **Contact Form** - Serverless email via EmailJS
- **Dark/Light Theme** - System preference detection with manual toggle
- **Mobile Responsive** - Hamburger menu for mobile navigation
- **PDF Viewer** - Embedded proposal/document viewer
- **Performance Optimized** - Lazy loading, Brotli/Gzip compression, caching
- **SEO Ready** - Open Graph, Twitter Cards, JSON-LD structured data

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | ASP.NET Core MVC (.NET 10) |
| Language | C# |
| Styling | Vanilla CSS (CSS Variables) |
| Icons | Font Awesome 6 |
| Fonts | Google Fonts (Inter) |
| Hosting | Railway |

## Quick Start

```bash
# Clone
git clone https://github.com/weekijie/Portfolio.git
cd Portfolio

# Run
dotnet run
```

Open http://localhost:5257

## Configuration

### Profile Data
Edit `Data/profile.json` to update:
- Bio & contact info
- Experience & education
- Certifications & competitions
- Skills

### EmailJS (Contact Form)
1. Create account at [emailjs.com](https://emailjs.com)
2. Create service and template
3. Set environment variables:
   ```
   EmailJS__ServiceId=your_service_id
   EmailJS__TemplateId=your_template_id
   EmailJS__PublicKey=your_public_key
   ```

### Documents
Place PDFs in `wwwroot/documents/` and reference in `profile.json`:
```json
"proposalUrl": "/documents/MyProposal.pdf"
```

## Deployment (Railway)

1. Push to GitHub
2. Connect repo to [Railway](https://railway.app)
3. Add environment variables
4. Railway auto-deploys via Dockerfile

## Project Structure

```
Portfolio/
├── Controllers/       # MVC controllers
├── Data/              # profile.json
├── Models/            # View models
├── Services/          # GitHub & Profile services
├── Views/             # Razor views
├── wwwroot/           # Static assets (CSS, JS, documents)
├── Dockerfile         # Container config
└── Program.cs         # App configuration
```

## License

MIT
