const GITHUB_USERNAME = 'weekijie';
const DEFAULT_CONFIG = {
    emailJs: {
        publicKey: '',
        serviceId: '',
        templateId: ''
    },
    siteUrl: 'https://weekijie.github.io/Portfolio'
};

document.addEventListener('DOMContentLoaded', async () => {
    setFooterYear();
    initThemeToggle();

    const [profile, repositories, config] = await Promise.all([
        loadJson('data/profile.json', null),
        loadJson('data/repos.json', []),
        loadJson('data/site-config.json', DEFAULT_CONFIG)
    ]);

    if (profile) {
        renderProfile(profile);
    }

    renderRepositories(Array.isArray(repositories) ? repositories : []);
    initTabs();
    initNavigation();
    initScrollReveal();
    initBackToTop();
    initTypingAnimation();
    initLightbox();
    initContactForm(config || DEFAULT_CONFIG);
});

async function loadJson(path, fallbackValue) {
    try {
        const response = await fetch(path, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`Request failed for ${path}: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.warn(error);
        return fallbackValue;
    }
}

function renderProfile(profile) {
    document.title = `${profile.name || 'Wee Ki Jie'} | Portfolio`;
    setText('introText', profile.bio || '');
    setLinkVisibility('resumeButton', normalizeUrl(profile.resumeUrl));
    setLinkVisibility('linkedinLink', profile.linkedIn);
    setLinkVisibility('linkedinFooterLink', profile.linkedIn);
    setMailLink('emailHeroLink', profile.email);
    setMailLink('emailFooterLink', profile.email);

    const githubUrl = `https://github.com/${GITHUB_USERNAME}`;
    setLink('githubHeroLink', githubUrl);
    setLink('githubFooterLink', githubUrl);
    setLink('viewMoreProjects', `${githubUrl}?tab=repositories`);

    renderWork(profile.experience || []);
    renderEducation(profile.education || []);
    renderCertifications(profile.certifications || []);
    renderCompetitions(profile.competitions || []);
    renderSkills(profile.skills || []);
}

function renderWork(experience) {
    const container = document.getElementById('workList');
    if (!container) {
        return;
    }

    container.innerHTML = experience.length
        ? experience.map(job => `
            <div class="experience-card">
                <div class="experience-header">
                    <div class="company-logo">
                        ${job.iconUrl
                ? `<img src="${escapeAttribute(job.iconUrl)}" alt="${escapeAttribute(job.company)}" class="logo-image" loading="lazy" />`
                : `<span class="logo-letter">${escapeHtml((job.company || '?').charAt(0))}</span>`}
                    </div>
                    <div class="experience-info">
                        <h3 class="experience-title">${escapeHtml(job.title || '')}</h3>
                        <a href="${escapeAttribute(job.companyUrl || '#')}" target="_blank" rel="noopener" class="company-name">${escapeHtml(job.company || '')}</a>
                        <div class="experience-meta">
                            <span class="period">${escapeHtml(job.period || '')}</span>
                            ${job.type ? `<span class="type-badge">${escapeHtml(job.type)}</span>` : ''}
                        </div>
                    </div>
                </div>
                <ul class="experience-description">
                    ${(job.description || []).map(point => `<li>${escapeHtml(point)}</li>`).join('')}
                </ul>
            </div>
        `).join('')
        : emptyState('Experience will appear here soon.');
}

function renderEducation(education) {
    const container = document.getElementById('educationList');
    if (!container) {
        return;
    }

    container.innerHTML = education.length
        ? education.map(item => `
            <div class="experience-card">
                <div class="experience-header">
                    <div class="company-logo">
                        ${item.iconUrl
                ? `<img src="${escapeAttribute(item.iconUrl)}" alt="${escapeAttribute(item.institution)}" class="logo-image" loading="lazy" />`
                : `<span class="logo-letter">${escapeHtml((item.institution || '?').charAt(0))}</span>`}
                    </div>
                    <div class="experience-info">
                        <h3 class="experience-title">${escapeHtml(item.degree || '')}</h3>
                        <a href="${escapeAttribute(item.institutionUrl || '#')}" target="_blank" rel="noopener" class="company-name">${escapeHtml(item.institution || '')}</a>
                        <div class="experience-meta">
                            <span class="period">${escapeHtml(item.year || '')}</span>
                        </div>
                    </div>
                </div>
                ${item.description ? `<p class="education-description">${escapeHtml(item.description)}</p>` : ''}
            </div>
        `).join('')
        : emptyState('Education details will appear here soon.');
}

function renderCertifications(certifications) {
    const section = document.getElementById('certifications-section');
    const container = document.getElementById('certificationsList');
    if (!section || !container) {
        return;
    }

    if (!certifications.length) {
        section.classList.add('is-hidden');
        return;
    }

    section.classList.remove('is-hidden');
    container.innerHTML = certifications.map(cert => `
        <div class="certification-card">
            <div class="cert-icon">
                ${cert.iconUrl
            ? `<img src="${escapeAttribute(cert.iconUrl)}" alt="${escapeAttribute(cert.issuer)}" class="logo-image" loading="lazy" />`
            : '<i class="fas fa-certificate"></i>'}
            </div>
            <div class="cert-info">
                <h3 class="cert-name">${escapeHtml(cert.name || '')}</h3>
                <p class="cert-issuer">${escapeHtml(cert.issuer || '')}</p>
                <span class="cert-date">Issued ${escapeHtml(cert.issueDate || '')}</span>
            </div>
            ${cert.credentialUrl
            ? `<a href="${escapeAttribute(cert.credentialUrl)}" target="_blank" rel="noopener" class="cert-link"><i class="fas fa-external-link-alt"></i></a>`
            : ''}
        </div>
    `).join('');
}

function renderRepositories(repositories) {
    const container = document.getElementById('projectsList');
    if (!container) {
        return;
    }

    container.innerHTML = repositories.length
        ? repositories.map(repo => `
            <div class="project-card">
                <div class="project-header">
                    <h3 class="project-name">${escapeHtml(repo.name || '')}</h3>
                    <div class="project-links">
                        ${repo.homepageUrl
                ? `<a href="${escapeAttribute(repo.homepageUrl)}" target="_blank" rel="noopener" class="demo-link" title="Live Demo" onclick="event.stopPropagation();"><i class="fas fa-external-link-alt"></i></a>`
                : ''}
                        <a href="${escapeAttribute(repo.htmlUrl || '#')}" target="_blank" rel="noopener" class="github-link" title="View on GitHub">
                            <i class="fab fa-github"></i>
                        </a>
                    </div>
                </div>
                <a href="${escapeAttribute(repo.htmlUrl || '#')}" target="_blank" rel="noopener" class="project-card-body">
                    <p class="project-description">${escapeHtml(repo.description || 'No description provided')}</p>
                    <div class="project-footer">
                        <div class="project-stats">
                            ${repo.stargazersCount > 0 ? `<span class="stat"><i class="fas fa-star"></i> ${repo.stargazersCount}</span>` : ''}
                            ${repo.forksCount > 0 ? `<span class="stat"><i class="fas fa-code-branch"></i> ${repo.forksCount}</span>` : ''}
                        </div>
                        <div class="project-tags">
                            ${repo.language && repo.language !== 'Unknown' ? `<span class="tag language-tag">${escapeHtml(repo.language)}</span>` : ''}
                            ${(repo.topics || []).slice(0, 2).map(topic => `<span class="tag">${escapeHtml(topic)}</span>`).join('')}
                        </div>
                    </div>
                </a>
            </div>
        `).join('')
        : emptyState('Featured repositories will appear after the next successful build.');
}

function renderCompetitions(competitions) {
    const section = document.getElementById('competitions-section');
    const container = document.getElementById('competitionsList');
    if (!section || !container) {
        return;
    }

    if (!competitions.length) {
        section.classList.add('is-hidden');
        return;
    }

    section.classList.remove('is-hidden');
    container.innerHTML = competitions.map(comp => {
        const proposalUrl = normalizeUrl(comp.proposalUrl);
        const imageUrl = normalizeUrl(comp.imageUrl);

        return `
            <div class="competition-card">
                <div class="competition-header">
                    <div class="comp-icon-wrapper">
                        ${comp.iconUrl
                ? `<img src="${escapeAttribute(comp.iconUrl)}" alt="${escapeAttribute(comp.organizer)}" class="logo-image" loading="lazy" />`
                : '<div class="comp-icon-placeholder"><i class="fas fa-trophy"></i></div>'}
                    </div>
                    <div class="comp-header-info">
                        <h3 class="comp-name">${escapeHtml(comp.name || '')}</h3>
                        <div class="comp-organizer">${escapeHtml(comp.organizer || '')}</div>
                    </div>
                    ${comp.credentialUrl
                ? `<a href="${escapeAttribute(comp.credentialUrl)}" target="_blank" rel="noopener" class="comp-link" title="View Credential"><i class="fas fa-external-link-alt"></i></a>`
                : ''}
                </div>
                <div class="comp-meta">
                    <span class="award-badge"><i class="fas fa-medal"></i> ${escapeHtml(comp.award || '')}</span>
                    <span class="comp-date">${escapeHtml(comp.date || '')}</span>
                </div>
                <p class="comp-description">${escapeHtml(comp.description || '')}</p>
                ${proposalUrl
                ? `
                    <details class="comp-proposal">
                        <summary class="proposal-toggle"><i class="fas fa-file-pdf"></i> View Proposal / Document</summary>
                        <div class="proposal-content">
                            <div class="proposal-actions" style="padding: 0.5rem; text-align: right; background: var(--bg-secondary); border-bottom: 1px solid var(--border);">
                                <a href="${escapeAttribute(proposalUrl)}" target="_blank" rel="noopener" style="font-size: 0.9rem; color: var(--accent); text-decoration: none;">
                                    <i class="fas fa-external-link-alt"></i> Open in new tab
                                </a>
                            </div>
                            <iframe src="${escapeAttribute(proposalUrl)}" class="proposal-frame" title="Proposal Document" loading="lazy">
                                Your browser does not support inline PDFs. <a href="${escapeAttribute(proposalUrl)}" target="_blank" rel="noopener">Open PDF</a>
                            </iframe>
                        </div>
                    </details>
                `
                : ''}
                ${imageUrl
                ? `<div class="comp-image-container"><img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(comp.name || '')}" class="comp-featured-image" loading="lazy" /></div>`
                : ''}
            </div>
        `;
    }).join('');
}

function renderSkills(skills) {
    const section = document.getElementById('skills-section');
    const container = document.getElementById('skillsList');
    if (!section || !container) {
        return;
    }

    if (!skills.length) {
        section.classList.add('is-hidden');
        return;
    }

    section.classList.remove('is-hidden');
    container.innerHTML = skills.map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('');
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        html.dataset.theme = savedTheme;
    } else if (systemPrefersDark) {
        html.dataset.theme = 'dark';
    }

    updateThemeIcon(themeToggle, html.dataset.theme);

    themeToggle?.addEventListener('click', () => {
        const nextTheme = html.dataset.theme === 'dark' ? 'light' : 'dark';
        html.dataset.theme = nextTheme;
        localStorage.setItem('theme', nextTheme);
        updateThemeIcon(themeToggle, nextTheme);
    });
}

function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            tabs.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            document.getElementById(`${tabName}-content`)?.classList.add('active');
        });
    });
}

function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks?.classList.toggle('active');
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', event => {
            const targetSelector = anchor.getAttribute('href');
            const target = targetSelector ? document.querySelector(targetSelector) : null;

            if (!target) {
                return;
            }

            event.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            navLinks?.classList.remove('active');
            hamburger?.classList.remove('active');
        });
    });

    document.addEventListener('click', event => {
        const target = event.target;
        if (!hamburger || !navLinks || !(target instanceof Node)) {
            return;
        }

        if (!hamburger.contains(target) && !navLinks.contains(target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

function initScrollReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    document.querySelectorAll('.experience-card, .certification-card, .project-card, .competition-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}

function initBackToTop() {
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop?.classList.add('visible');
        } else {
            backToTop?.classList.remove('visible');
        }
    });

    backToTop?.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function initTypingAnimation() {
    const greeting = document.querySelector('.greeting');
    if (!greeting) {
        return;
    }

    const text = greeting.textContent || 'hi!';
    greeting.textContent = '';
    greeting.classList.add('typing');

    let index = 0;
    const typeWriter = () => {
        if (index < text.length) {
            greeting.textContent += text.charAt(index);
            index += 1;
            setTimeout(typeWriter, 100);
        } else {
            greeting.classList.remove('typing');
        }
    };

    setTimeout(typeWriter, 500);
}

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');

    document.querySelectorAll('.comp-featured-image').forEach(image => {
        image.style.cursor = 'pointer';
        image.addEventListener('click', () => {
            if (!lightbox || !lightboxImage) {
                return;
            }

            lightboxImage.src = image.src;
            lightboxImage.alt = image.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeLightbox = () => {
        lightbox?.classList.remove('active');
        document.body.style.overflow = '';
    };

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', event => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeLightbox();
        }
    });
}

function initContactForm(config) {
    const form = document.getElementById('contactForm');
    if (!form) {
        return;
    }

    const emailConfig = config?.emailJs || DEFAULT_CONFIG.emailJs;
    if (window.emailjs && emailConfig.publicKey) {
        window.emailjs.init(emailConfig.publicKey);
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const statusDiv = document.getElementById('formStatus');
        const btnText = form.querySelector('.btn-text');
        const btnLoading = form.querySelector('.btn-loading');

        if (!window.emailjs || !emailConfig.publicKey || !emailConfig.serviceId || !emailConfig.templateId) {
            if (statusDiv) {
                statusDiv.innerHTML = '<span class="status-error">Contact form not configured. Please email directly.</span>';
            }
            return;
        }

        if (btnText) {
            btnText.style.display = 'none';
        }
        if (btnLoading) {
            btnLoading.style.display = 'inline-flex';
        }
        if (statusDiv) {
            statusDiv.innerHTML = '';
        }

        try {
            await window.emailjs.sendForm(emailConfig.serviceId, emailConfig.templateId, form);
            if (statusDiv) {
                statusDiv.innerHTML = '<span class="status-success"><i class="fas fa-check-circle"></i> Message sent successfully!</span>';
            }
            form.reset();
        } catch (error) {
            console.error('EmailJS error:', error);
            if (statusDiv) {
                statusDiv.innerHTML = '<span class="status-error"><i class="fas fa-exclamation-circle"></i> Failed to send. Please try again or email directly.</span>';
            }
        } finally {
            if (btnText) {
                btnText.style.display = 'inline-flex';
            }
            if (btnLoading) {
                btnLoading.style.display = 'none';
            }
        }
    });
}

function setFooterYear() {
    setText('footerYear', new Date().getFullYear());
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element && value) {
        element.textContent = value;
    }
}

function setLink(id, href) {
    const element = document.getElementById(id);
    if (element && href) {
        element.href = href;
    }
}

function setLinkVisibility(id, href) {
    const element = document.getElementById(id);
    if (!element) {
        return;
    }

    if (href) {
        element.href = href;
        element.classList.remove('is-hidden');
    } else {
        element.classList.add('is-hidden');
    }
}

function setMailLink(id, email) {
    setLinkVisibility(id, email ? `mailto:${email}` : '');
}

function updateThemeIcon(themeToggle, theme) {
    const icon = themeToggle?.querySelector('i');
    if (!icon) {
        return;
    }

    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function normalizeUrl(url) {
    if (!url) {
        return '';
    }

    if (/^(https?:)?\/\//i.test(url) || url.startsWith('mailto:') || url.startsWith('#')) {
        return url;
    }

    return url.replace(/^\/+/, '');
}

function emptyState(message) {
    return `<p class="empty-state">${escapeHtml(message)}</p>`;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
    return escapeHtml(normalizeUrl(value));
}
