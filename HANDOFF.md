# Juno website handoff

26 October 2026 · Private-beta showcase · Published and verified

Project: `C:\Dev\Projects\Juno\backups\juno-website`  
Branch: `codex/website-refinement`
Commit: see the delivered Git commit in the chat and `git log -1 --oneline`. The source, artwork, capture provenance, and verification evidence are committed together.

Local website: http://127.0.0.1:5272/  
Built production preview used for acceptance: http://127.0.0.1:5273/  
Public website: https://juno-website-two.vercel.app/
Private repository: https://github.com/tanishkfr/juno-website (`main`).
Vercel project: `juno-website`, ID `prj_Xclj2KWqzCwOQgeCqKuW80K5dWAr`. See `DEPLOYMENT.md` for production verification.

## What shipped

A complete independent Vite/TypeScript website with semantic HTML and CSS, self-hosted fonts, no backend, and roughly 4.72 KB of compressed application JavaScript including playback controls. The production build is in `dist/`; `vercel.json` prepares a separate Vercel project. The site has no download, signup, waitlist, fabricated testimonial, or artificial availability promise.

The refined narrative opens with an illustrative conversation in the actual app, plus a three-view Conversation / Workspace / Code preview. It continues through the dark oversized Kyoto exhibit, all six companions and their actual personality profiles, four paired Computer/Research/Routines/Results panels, the actual Code file editor, Teams, Orb Studio, local-first controls, and a dark private-beta close with an enormous outline traced from Kyoto’s true pixel grid. The repeated standalone conversation section is removed. Teams uses a clearer example-role breakdown and leads with its product image on mobile.

The owner’s later screenshot references are incorporated directly into the composition: the character breaks above and below its dark stage, the feature panels use focused real product details, and the final orb outline carries the page into a restrained dark footer. The header uses a true bold Geist face for Juno. Its Kyoto-red Request access link opens a prefilled email draft to madebytanishk@gmail.com. The closing section retains the private-beta statement and repeats this contact action, with the outline orb below the contact text.

Grok Bot supplied the composition and pacing reference, including large characters, paired demonstrations, restrained dark stages, and the oversized outline close. ChatGPT supplied typographic restraint and image/copy relationships. MausBot was also inspected. No proprietary reference artwork, copy, logos, screenshots, or code is in the published website.

## Product photography

Nine new authentic captures are retained in `source-assets/`, with optimized WebP variants and full-image views. Six canonical orbs are exported from Juno’s deterministic renderer. The refined Kyoto app icon is unchanged. No product screenshots or replacement mascots were generated.

The photographs use a copied source tree and disposable profiles. The featured conversation is explicitly illustrative; no simulated provider or tool output is represented as verified live work. The Code image shows actual local file editing with its provider unavailable. Computer access is off in the controls image. The routine is a genuine paused example schedule. The Results image shows the real empty state. See `ASSET-INVENTORY.md` for each source, crop and qualification.

Desktop source baseline: `c7q5b/complete-product-ui-overhaul` at `86b0f418e7161367f1132e1381f2fd001cccef94`. The baseline tracked files were clean before and after capture. Desktop source, release configuration, branch, installer and packaging files were not edited.

## Verification

- Workflow demo: the 21.88-second H.264 MP4 decodes, plays, seeks and ends in Chrome; captions load and the exact transcript matches the genuine provider receipt. Failure recovery keeps a retry action and transcript available.
- Copy-email fallback: the correct address is written to the clipboard; denied clipboard access selects the visible address for manual copying. The closing outline clears the full contact area.
- Beta expectations are sourced from the desktop README and provider setup components. No response-time or invite guarantee is added. Physical-device compatibility testing is excluded at the owner's request.

- Looping motion: PASS. The real screenshots cycle every five seconds with a 450ms crossfade; the oversized Kyoto and all six selected portraits have nine-frame blink, smile and glance loops over 12 seconds. All have pause controls, respect reduced motion, and suspend offscreen or in background tabs. Manual selection or image focus stops the tour; hovering suspends it. No animation library was added. The six expression animations total 6,240 bytes and use actual character recipes and face parts.
- `npm run verify:motion`: PASS against the built preview. Browser checks cover tour wrapping, pause/resume, manual selection, hover, offscreen suspension and changing reduced-motion preferences. A separate real-time Chrome session confirms rendered expression changes, return to rest and tour advancement. Evidence: `evidence/motion/verification.json`; local recording: `evidence/motion/loops.webm`.
- The motion refinement was also checked with the full five-viewport acceptance suite; all five use production module `index-Dfbw7rql.js`. Existing navigation, image inspection and keyboard flows pass with no axe violations or runtime errors. Mobile visual review caught and corrected a collision between Kyoto's blossom and the new pause control. The earlier Lighthouse numbers below predate this motion refinement; no new performance score is claimed.

- `npm run build`: PASS, including strict TypeScript checking and the production Vite build.
- `npm run verify` against the built production preview: PASS after the final dialog focus correction.
- Chrome at 1920×1080, 1366×768, 834×1112, 390×844 and 320×740: no horizontal overflow, broken loaded images, invalid in-page anchors, or axe WCAG A/AA violations.
- All six companions and arrow-key selection; all four feature photograph viewers; full-image loading; forward/backward dialog tab containment; Escape; focus return; mobile navigation; beta availability navigation; reduced motion: PASS.
- The refinement adds all three preview tabs and keyboard selection, active navigation, actual-size mobile image inspection, fit restoration, and a dismissible failed-image state. Current machine-readable results are in `evidence/verification.json`.
- Core content without JavaScript: rendered and captured. Interactive galleries require JavaScript.
- No runtime exceptions or failing website resource requests in the final automated browser run.
- `npm audit --omit=optional`: zero vulnerabilities.
- Desktop, mobile and section screenshots: `evidence/`. Machine-readable final acceptance: `evidence/verification.json`.

Visual inspection caught and corrected the initial screenshot’s startup state, distorted decorative orbs, low-contrast entrance opacity, narrow mobile overflow, an overly broad Computer crop, and a Shift-Tab focus issue. The final page uses real, settled captures, proportionate artwork, already-legible motion, and keyboard-contained image viewing.

## Performance evidence and its boundary

The figures below describe the earlier implementation. The subsequent refinement's current performance evidence and before/after comparison are recorded in `REFINEMENT-REVIEW.md`; do not treat older audit files as measurements of the newer interaction code.

The final scoped Lighthouse mobile audit is `evidence/lighthouse-final-mobile-scoped.json`: performance **97**, accessibility **100**, SEO **100**, best practices **81**; FCP **1.8 s**, LCP **2.4 s**, blocking time **0 ms**, layout shift **0**. It uses Lighthouse’s simulated mobile profile against the local production build.

That scoped audit excludes only requests to the antivirus-injected `kaspersky-labs.com` host from its test browser. It does not disable or change antivirus settings. The unfiltered production baseline is retained in `evidence/lighthouse-production-mobile.json`; it scored performance 79 and included a 184 KB render-blocking script injected by that software. These are different test conditions, not public field-performance claims. Those earlier local HTTP audits predate the now-published HTTPS site; they are not current production-performance scores.

## Remaining boundaries

The original product photographs establish actual UI and configuration states. The new 22-second workflow demo records one genuine composer request and real provider response through an isolated Juno renderer and server. It does not demonstrate browser/computer control, research or delegated team execution. Firefox, Safari and physical phones were not tested. The public Vercel origin and its canonical/social metadata are now verified; see DEPLOYMENT.md.

During screenshot setup, an import-order error wrote four demo messages to a new orphan thread in the default data store. The owner approved the exact cleanup; the guarded repair removed only those four rows and the newly inserted thread state, and verified their removal. The corrected writer uses an explicit disposable database path. This incident and its resolution are recorded in `ASSET-INVENTORY.md`.

## Run and deploy

```powershell
npm ci
npm run dev
npm run build
npm run preview
npm run verify
```

The owner authorized repository creation, pushing and production deployment. The site is now published as its own Vercel project, build command `npm run build`, output `dist`, Node 24. The separate capture studio is not a build dependency. The full browser and motion suites pass against the public HTTPS origin; public file integrity is checked against the local production build by scripts/verify-deployment.mjs. Private source paths return 404.

Latest refinement: the real workflow demo autoplays muted, with native pause controls and a manual play fallback if autoplay is blocked. Reduced-motion visitors retain manual playback. The gallery’s Pause tour and Pause characters buttons were removed; gallery tabs, hover suspension and the companion exhibit controls remain. Five browser viewport checks passed; physical devices were not tested.
