# Juno website

Independent private-beta showcase for Juno. Vite, TypeScript, semantic HTML and CSS. No backend, accounts, analytics, external runtime scripts, public signup, or downloads.

## Run

Requires Node 22.12+.

```powershell
npm ci
npm run dev
```

Preview: http://127.0.0.1:5272

```powershell
npm run build
npm run preview
npm run verify
```

`verify` expects Google Chrome installed and a running local preview. Set `WEBSITE_URL` to test a different owned preview. It checks five viewports, WCAG rules with axe, images, anchors, companion selection, feature photographs, dialog keyboard behavior, mobile navigation, the beta availability link, reduced motion, and static content without JavaScript. It writes the evidence directory.

`npm run assets` regenerates the WebP assets from the untouched source screenshots and creates the social preview. Fonts and character exports are already included. The website builds independently; the separate screenshot studio and desktop source are not needed to run or deploy it.

## Deploy

Import this directory into its own Vercel project. `vercel.json` defines the build and output. Deploy a preview first, then verify it. Production publishing and a public domain need owner approval. No remote repository or deployment has been created by this task.

Use the final approved public domain for canonical metadata and absolute social-preview URLs once it exists; none is invented here.

## Product photographs

See [ASSET-INVENTORY.md](ASSET-INVENTORY.md) for sources and capture qualifications. Text in the featured conversation is illustrative. The Code image shows real local file editing, with its provider unavailable. Computer access is off in the control image. No image represents a simulated tool result as successful live execution.

The captured desktop source is `c7q5b/complete-product-ui-overhaul` at `86b0f418e7161367f1132e1381f2fd001cccef94`. Its source and release configuration were not edited. The screenshot studio is a separate disposable copy at `../juno-website-studio`.

Detailed results and limitations: [HANDOFF.md](HANDOFF.md). The subsequent competitor comparison, refinements and current performance evidence are in [REFINEMENT-REVIEW.md](REFINEMENT-REVIEW.md).
