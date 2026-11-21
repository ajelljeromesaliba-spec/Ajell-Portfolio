# Ajell Saliba — Personal Portfolio V6

A responsive, static personal portfolio. Content covers real web implementation, CRM automation, quality assurance, customer service and team leadership. The site does not present private customer data or fabricate client performance metrics.

## Live architecture

- `index.html` — accessible personal portfolio, eight work examples, four-stage narrative, career details, tool stack and testimonial
- `styles-v6.css` — responsive typography, sticky 3D scenes, performant CSS presentation
- `script-v6.js` — one scroll scheduler, cached geometry, transform-only animation, project filters, mobile menu, Lite/Full control
- `assets/*.webp` — three optimized, AI-assisted editorial portraits derived from user-supplied references
- `resume-v2.html` — existing résumé, retained in repository

## Scroll and performance

- Hero: 355svh desktop; 270svh small phones
- 3D system sequence: 680svh desktop; 490svh small phones
- Noir interlude: 285svh desktop; 208svh small phones
- Four meaningful systems chapters and a live checklist that changes with the scroll position
- Touch / data-saving / low-core devices default to `Lite`, which keeps 3D movement but avoids heavy effects. Visitors may choose `Full` using the Motion control.
- `prefers-reduced-motion: reduce` presents a static, readable version.
- No WebGL runtime or animation framework required.

## Deploy

Deploy the repository root to the existing Cloudflare Workers static-assets project. The production branch is `main`; the existing GoDaddy domain does not need to be changed.

## Verification

Tested in headless Chromium with 1440×900 and 390×844 viewports, including navigation, work filters, motion control, scene stages, reduced-motion fallback and horizontal overflow. A synthetic 4× CPU slowdown is not a substitute for checking the site on a physical phone.