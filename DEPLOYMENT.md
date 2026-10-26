# Production release

26 October 2026.

- Website: https://juno-website-two.vercel.app/
- Private repository: https://github.com/tanishkfr/juno-website
- Production branch: `main`.
- Vercel team: `tanishkfrs-projects`, `team_VOeLK7yFGO2OfGuEOsffIywY`.
- Vercel project: `juno-website`, `prj_Xclj2KWqzCwOQgeCqKuW80K5dWAr`.
- Initial production deployment: `dpl_AFPdcmqY1GFJ9V1mdamejq1xR5iy`, source `ef7411456dccb54db6e1d365c7379738ddec5dda`.
- Build: `npm ci`, `npm run build`, output `dist`, Node 24. No backend or environment secrets required.

The repository was confirmed PRIVATE before pushing. GitHub's remote `main` matched the intended local commit. Vercel cloned the same repository and source commit, built successfully, and assigned the production domain. The Git connection was independently confirmed through Vercel's project context. The production domain is publicly accessible; preview and generated deployment URLs keep standard Vercel Authentication. Public source browsing on Vercel is disabled.

## Verification

All checks use the real public HTTPS domain without cookies, sign-in, or protection bypasses.

- Full Chrome browser acceptance: PASS at 1920×1080, 1366×768, 834×1112, 390×844 and 320×740. No horizontal overflow, broken loaded images, missing in-page anchors, runtime exceptions or axe WCAG A/AA violations. All viewports loaded production module `index-VYcPEX-X.js`.
- Interaction checks: PASS for all preview tabs and arrow-key navigation; all six companions; feature screenshot viewers; actual-size mobile inspection; dialog focus trapping, Escape and focus restoration; image failure recovery; mobile menu; section navigation; beta link; reduced motion; content with JavaScript disabled.
- Motion checks: PASS for the complete three-view tour and wrapping, pause/resume, manual selection stopping playback, hover/offscreen suspension, companion playback and dynamic reduced motion. A separate real-time Chrome recording confirms actual expression changes, return to rest and screenshot tour advancement.
- Public file integrity: PASS. All 45 files in the local `dist` match the deployed bytes by SHA-256, including full-resolution photographs, fonts, the animated WebP, social image, CSS and JavaScript. HTTPS responses carry the configured security headers. Canonical and social URLs use the actual domain.
- Source isolation: PASS. `/.git/config`, `/.env`, `/source-assets/companions.json` and `/HANDOFF.md` all return 404.
- Local build and dependency audit: PASS, zero reported vulnerabilities.

Current evidence: `evidence/verification.json`, `evidence/motion/verification.json`, `evidence/motion/loops.webm`, `evidence/deployment-http.json`, and the desktop/mobile screenshots in `evidence/`. Release documentation and test-only changes after the initial deployment do not change the verified website bundle.

Firefox, Safari, physical devices and manual screen-reader testing were not performed. Earlier Lighthouse files measure local builds, not production. This verifies the website and its real product photography; it does not claim execution of Juno desktop tools, research or external AI providers.
