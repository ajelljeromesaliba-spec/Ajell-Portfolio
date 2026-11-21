# Ajell Saliba — Portfolio v2

A premium, responsive portfolio for web implementation, GoHighLevel automation, and client operations.

- Static HTML, CSS and vanilla JavaScript; no build step or packages.
- Original WebGL raymarched rotating 3D chrome orbital sculpture, no external shader libraries.
- Graceful CSS 3D fallback for clients without WebGL, reduced-motion support.
- Scroll reveals, kinetic typography, animated ticker, project treatments, responsive mobile menu.
- Public project links, factual work-history and professional résumé.

## Cloudflare deployment

**If you use Cloudflare Pages Git integration:** select this GitHub repository, branch `main`, framework preset **None**, build command blank, build output directory `.`.

**If you use Cloudflare Workers Builds:** configure static assets with `wrangler.jsonc` (or point Workers build output at `./`) and ensure the build deploys the root directory. The repository is static and does not require npm.

The repo is separate from ConnectiveStack. HTTPS URL will be assigned by Cloudflare upon successful deployment.

### Workers Builds static assets (workers.dev)

The included `wrangler.jsonc` names the Worker `ajell-portfolio` to match the current workers.dev deployment, and serves the static site at the repository root. If the project is Git-connected with Workers Builds, ensure the deploy command is `npx wrangler deploy` (framework preset is **None**). This config does not touch ConnectiveStack.