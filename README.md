# Ajell Saliba — Personal Portfolio

A responsive static portfolio for job applications and selected client work. Built with HTML, CSS, and vanilla JavaScript. No build tooling, paid services, API keys, or external UI dependencies are required. Google Fonts are optional and gracefully fall back to system fonts.

## Files
- `index.html`: semantic content, SEO/Open Graph metadata, links, sections.
- `styles.css`: dark design system, 3D-style CSS hero, responsive layouts, reduced-motion handling.
- `script.js`: project filters, workflow stage tabs, mobile navigation, copy-email, scroll progress, scroll reveal, and pointer interaction.
- `assets/Ajell_Saliba_Resume.pdf`: downloadable résumé.
- `assets/favicon.svg`, `assets/og-cover.svg`: site identity and share preview.

## Preview locally
Run `python3 -m http.server 8080` from the project directory and visit `http://localhost:8080`.

## Deploy
Upload the folder to a static host or deploy via Vercel using Framework Preset **Other**, Root Directory `/`, no build command and no output directory. `index.html` is the entry page.

## Checklist before public sharing
1. Verify the public ConnectiveStack and Aleesa Talmadge URLs still work and that client work may be used in a public portfolio.
2. Confirm the PDF résumé's contact details and exact dates are up to date.
3. Replace the default meta preview URL with the final website URL if desired.
4. Open in desktop and mobile browsers, test all links, tabs, email and résumé download.

No fake revenue metrics, fabricated results, or client records are published in the site.
## Hosting
Deploy the root of this repository as a static Cloudflare Pages project. Build command: leave blank; output directory: / (root). The primary branch is `main`.
