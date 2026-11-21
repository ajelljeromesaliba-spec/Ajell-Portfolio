# Ajell Saliba — Immersive Personal Portfolio V5

A static personal portfolio focused on web implementation, CRM automation, QA, client operations and support leadership. Industry-neutral and designed for job applications and selected client work.

## Scroll scenes
- **01 / Hero camera**: Scroll-scrubbed photo depth, perspective move, text recession and three explanatory planes that reveal the connected process.
- **02 / Working architecture**: A four-stage, scroll-controlled 3D system using DOM/CSS perspective, not a decorative spinning object. Website inquiry, CRM routing, QA and complete delivery each have visual states. The stage buttons and 3D cards are clickable and change the scroll position.
- **03 / Work proof**: Project visual planes turn in perspective as they enter the viewport. Public work links and category filters stay functional.
- **04 / Editorial**: A pinned black-and-white portrait with a scroll-controlled reveal, depth movement and caption transition.

Only the three recent AI-assisted editorial images are included in the website. No photo gallery, no Aleesa Talmadge and no niche-specific sales claims.

## Build and hosting
The site uses standalone `index.html`, `styles-v5.css`, `script-v5.js` and `assets/*.webp`, plus the existing résumé and favicon. No build step and no third-party animation library. Cloudflare Workers static asset project serves the repository root from `main`.

## Accessibility and performance
- Native focusable interactive stage buttons and work filters.
- Smooth scroll uses requestAnimationFrame and updates only scenes in view.
- Motion is disabled and the 3D system is displayed as normal readable cards when users request reduced motion.
- Responsive mobile layout tested at 390px and desktop at 1440px, with no horizontal overflow.

GoDaddy DNS/domain settings are intentionally not changed by this commit.