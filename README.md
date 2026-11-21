# Ajell Saliba — Personal Portfolio

A responsive, static portfolio for job applications and selected client work, built with HTML, CSS, and vanilla JavaScript. No build dependencies, API keys, or environment variables are needed.

## Files

- `index.html`: homepage, project gallery, experience, contact and SEO metadata
- `styles.css`: responsive design, animation, and reduced-motion support
- `script.js`: mobile menu, project filters, interactive workflow, and copy-email action
- `resume.html`: printable résumé; use the **Print / Save as PDF** button
- `assets/favicon.svg`, `assets/og-cover.svg`: branding and social sharing preview

## Cloudflare Pages deployment (Git integration)

1. Open Cloudflare Dashboard > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Authorize GitHub and select `ajelljeromesaliba-spec/Ajell-Portfolio`.
3. Choose production branch `main`.
4. Set **Framework preset: None**, **Build command: blank** (or `exit 0`), and **Build output directory: .** (repository root). Leave **Root directory (advanced)** empty.
5. Choose **Save and Deploy**. Cloudflare will assign a `*.pages.dev` URL. Later pushes to `main` will trigger deployment automatically.

This portfolio is independent from the ConnectiveStack project and does not require a custom domain.

## Local preview

Run `python3 -m http.server 8080` from the repository root and open http://localhost:8080.

## Preflight

- Confirm that client project references may be published.
- Test résumé print/save, mobile menu, project filters, and links.
- Update the social preview URL after publishing if desired.

No fictional client revenue or conversion claims are presented.
