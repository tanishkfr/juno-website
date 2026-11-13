# Juno website

Independent private-beta showcase for Juno. Vite, TypeScript, semantic HTML and CSS. No backend, accounts, analytics, external runtime scripts, embedded signup form or public downloads. Access requests open a prefilled email draft for the visitor to review and send.

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
npm run verify:motion
```

`verify` expects Google Chrome installed and a running local preview. Set `WEBSITE_URL` to test a different owned preview. It checks five viewports, WCAG rules with axe, images, anchors, companion selection, feature photographs, dialog keyboard behavior, mobile navigation, the beta availability link, reduced motion, and static content without JavaScript. It writes the evidence directory.

`npm run assets` regenerates the WebP assets from the untouched source screenshots and creates the social preview. Fonts and character exports are already included. The website builds independently; the separate screenshot studio and desktop source are not needed to run or deploy it.

`verify:motion` defaults to port 5273; set `WEBSITE_URL=http://127.0.0.1:5272/` for the local preview, and run `npx playwright install ffmpeg` once for its recording. It checks the looping tour, pause/resume, manual selection, hover, offscreen suspension and dynamic reduced motion. It also records real elapsed Chrome playback and compares rendered Kyoto expressions as they change and return to rest. Results and a local WebM recording are saved in `evidence/motion/`.

The product demo is a genuine 22-second request and provider response, recorded in an isolated Juno renderer. Its full source recording, exact reply and timing receipt are retained in `source-assets/`; the public MP4 is a conversation close-up with captions and an exact transcript. Only initial loading is trimmed. `verify` checks real decoding, playback, seeking, captions, transcript agreement, playback-error recovery, clipboard success and denied-access fallback. Physical devices are outside this verification run.

## Deploy

Live website: [juno-website-two.vercel.app](https://juno-website-two.vercel.app/). Private source repository: [tanishkfr/juno-website](https://github.com/tanishkfr/juno-website), production branch `main`. The separate Vercel project `juno-website` is connected to this repository. `vercel.json` defines the build and output. The public production domain is accessible without signing in; preview and generated deployment URLs retain Vercel Authentication.

Canonical metadata and the absolute social-preview image use the assigned production domain. Release checks and evidence are in [DEPLOYMENT.md](DEPLOYMENT.md). To check production:

```powershell
$env:WEBSITE_URL='https://juno-website-two.vercel.app/'
npm run verify
npm run verify:motion
node scripts/verify-deployment.mjs
```

## Product photographs

See [ASSET-INVENTORY.md](ASSET-INVENTORY.md) for sources and capture qualifications. Text in the featured conversation is illustrative. The Code image shows real local file editing, with its provider unavailable. Computer access is off in the control image. No image represents a simulated tool result as successful live execution.

The captured desktop source is `c7q5b/complete-product-ui-overhaul` at `86b0f418e7161367f1132e1381f2fd001cccef94`. Its source and release configuration were not edited. The screenshot studio is a separate disposable copy at `../juno-website-studio`.

Detailed results and limitations: [HANDOFF.md](HANDOFF.md). The subsequent competitor comparison, refinements and current performance evidence are in [REFINEMENT-REVIEW.md](REFINEMENT-REVIEW.md).
