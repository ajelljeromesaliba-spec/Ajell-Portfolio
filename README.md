# Ajell Saliba | Personal Portfolio

Personal portfolio, deployed as a static Cloudflare Worker from the `main` branch.

## Site content
- A cinematic photo-led introduction and three-part career story
- One interactive visual chapter with optional Lite and Full motion
- Three selected work examples: ConnectiveStack, technical integrations, and ProClick
- Seven employers covering BPO, collections, support leadership, and web/CRM implementation
- Five feedback/reference entries with supplied portraits
- A print-ready résumé at `/resume-v2.html`

## Production assets
- `index.html`: page content and navigation
- `styles-qa-v20.css`: active styles combined in their existing cascade order
- `script-qa-v20.js`: site interactions, Matrix-style code rain, and the portrait rain effect
- `assets/`: photos, reviewer portraits, monogram and social media artwork
- `wrangler.jsonc`: Cloudflare Workers static assets configuration

The portfolio distinguishes linked public work from anonymized private work. Nathan Justice's entry is a professional reference, not a direct quotation.

## Deployment
Publish the repository's `main` branch to the Cloudflare Worker `ajell-portfolio`. The Worker serves static files from the repository root. No server API keys or secrets are embedded in the site.
