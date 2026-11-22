# Ajell Saliba / Personal Archive V14

A cinematic, photography-led personal portfolio. Static HTML/CSS/JavaScript deployed through the `Ajell-Portfolio` GitHub repository to Cloudflare Workers.

## Files

- `index.html`: main website, original case study text, 7 employers, 5 reviews
- `styles-v13.css`: retained structural and content-specific styling
- `styles-v14.css`: cinematic redesign and responsive art direction
- `script-v14.js`: scroll-linked perspective, chapter progression, motion intensity and accessible navigation
- `assets/`: optimized portrait and reviewer photographs, monogram, favicon and social image
- `resume-v2.html`: printable résumé retained in GitHub repo

The site intentionally does not pitch services as a business. Its focus is personal identity, experience, selected work and people who have worked with Ajell. Four private/public case studies and the five testimonial/reference entries have been retained from the established source. Where exact quotes were unavailable, a professional reference is labeled as such.

## Performance

Mobile starts in Lite mode; Full is opt-in and the motion toggle is functional. Animation uses scroll-progress transforms and opacity, while `prefers-reduced-motion` is respected. No WebGL library or paid infrastructure is required. V14 is intended to remain compatible with the existing Cloudflare Worker / GitHub deployment.