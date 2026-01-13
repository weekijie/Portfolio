# Portfolio Website

A personal portfolio website built with **ASP.NET Core MVC**. This project is designed to easily showcase your professional background, specific achievements like hackathons, and software projects using a clean, responsive design.

## Features

*   **Dynamic Content**: All profile information is managed via a single JSON file (`Data/profile.json`).
*   **Hackathons & Competitions**: Specialized section to showcase awards, featured project images, and even **embed PDF proposals** for direct viewing.
*   **GitHub Integration**: Automatically fetches and displays your public repositories and profile stats.
*   **Experience & Education**: Support for custom company/institution logos.
*   **Document Viewer**: Built-in support to view local PDF documents (e.g., project proposals) directly within the application.
*   **Responsive Design**: Modern UI that works well on desktop and mobile.

## Tech Stack

*   **Framework**: ASP.NET Core MVC (.NET 10)
*   **Language**: C#
*   **Styling**: Vanilla CSS (CSS Variables for theming)
*   **Data**: JSON (No database required for personal profile)

## Getting Started

### Prerequisites

*   [.NET SDK](https://dotnet.microsoft.com/download) (Version 10.0 or later)

### Running Locally

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd Portfolio
    ```

2.  Run the application:
    ```bash
    dotnet run
    ```

3.  Open your browser and navigate to:
    `http://localhost:5257`

## Customization

### Updating Profile Information
Edit the file `Data/profile.json`. This file contains all the data for:
*   Bio & Contact Info
*   Experience & Education
*   Certifications
*   Competitions
*   Skills

### Adding Images
You can use external URLs (e.g., LinkedIn media links) or local images.
*   **External**: Paste the URL into the `iconUrl` or `imageUrl` fields in `profile.json`.
*   **Local**: Place images in `wwwroot/images/` and reference them like `/images/my-photo.jpg`.

### Adding Documents (PDFs)
To display a proposal or document in the Competitions section:
1.  Place your PDF file in `wwwroot/documents/`.
2.  In `profile.json`, set the `proposalUrl` field for the entry:
    ```json
    "proposalUrl": "/documents/MyProposal.pdf"
    ```
3.  The application will automatically render a collapsible viewer for the document.
