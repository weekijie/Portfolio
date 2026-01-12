namespace Portfolio.Models;

public class ProfileData
{
    public string Name { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string LinkedIn { get; set; } = string.Empty;
    public string ResumeUrl { get; set; } = string.Empty;
    public List<Experience> Experience { get; set; } = new();
    public List<Education> Education { get; set; } = new();
    public List<Certification> Certifications { get; set; } = new();
    public List<string> Skills { get; set; } = new();
}

public class Experience
{
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string CompanyUrl { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Full-time, Intern, Contract
    public List<string> Description { get; set; } = new();
}

public class Education
{
    public string Degree { get; set; } = string.Empty;
    public string Institution { get; set; } = string.Empty;
    public string InstitutionUrl { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class Certification
{
    public string Name { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string IssueDate { get; set; } = string.Empty;
    public string CredentialUrl { get; set; } = string.Empty;
}
