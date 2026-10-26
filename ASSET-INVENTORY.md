# Product photography and artwork inventory

Captured on 26 October 2026 (Asia/Calcutta). Source verified locally: Juno branch `c7q5b/complete-product-ui-overhaul`, commit `86b0f418e7161367f1132e1381f2fd001cccef94`, clean tracked source state before and after. The current main checkout is a different branch; it was not used as the visual baseline.

The copied source lived in `C:\Dev\Projects\Juno\backups\juno-website-studio`. Its server used repository-owned `launchVerificationServer` isolation, a randomly named temporary data directory and separate Electron user-data profile. Vite optimizer output lived inside the studio. Installed dependencies were read from the existing node_modules junction; no dependency installation ran through that junction. The website has its own package-lock and independently installed dependencies.

All raw screenshots are retained in `source-assets/`. Every published WebP derives from one of these screenshots through Sharp, without generated UI or composited replacement text. Full-resolution views retain the entire original capture. Small presentation crops are documented below.

| Asset | Source and staging | Website use / qualification |
| --- | --- | --- |
| `agent-kyoto.png` | New conversation in real Juno Electron, 1440×900; Kyoto selected, light theme | Hero's Workspace preview. Clean canonical roster, no personal history or provider connections displayed. |
| `conversation.png` | Real Juno Electron, 1440×1040; four inert, authored text messages about a small bookshop pop-up, seeded only for display | Initial hero preview, clearly labeled illustrative. No claim of a live AI answer, real external work, tool completion or provider capability. |
| `computer-control.png` | Real Juno Electron, 1440×1040; adjacent Computer pane, Desktop view, access off | Tools and control story. Presentation crop x1086 y535 w335 h360 emphasizes the actual access choices. No desktop session or browser execution is claimed. |
| `code.png` | Real Juno Electron and real Boreal workspace, 1440×960; local `Fieldnotes` example project and `bookshop.js`; roster collapsed with the real toggle | Code story. No internal paths shown. Real file content and editor, not AI-generated code execution. The unavailable provider is visible and qualified in the page. |
| `teams.png` | Real Juno renderer, dialog crop 860×920; Bookshop studio draft, Kyoto/Prague/Seoul selected, responsibilities filled, Kyoto coordinator | Team-composition story. Draft configuration, not fabricated delegation activity. Draft was canceled. |
| `research.png` | Real Juno renderer, 1600×1000; typed question and open Quick/Standard/Deep menu; never sent | Research controls. Presentation crop x850 y690 w500 h310 improves menu readability on mobile; full image remains available. No research result is fabricated. |
| `routines.png` | Real Juno renderer, settings-dialog crop; an explicitly disabled Saturday reading schedule created through the genuine fixture API | Routines. Demonstration schedule, paused; no scheduled execution claimed. |
| `library.png` | Real Juno Electron, 1440×1040; actual Results panel with empty state | Results story. Presentation crop x1064 y32 w376 h300 emphasizes the panel header and empty state. No output files or results were invented. |
| `studio.png` | Real Juno renderer, dialog crop 1000×646; Kyoto’s Orb Studio Base section | Appearance story. Genuine appearance controls and canonical preview; no saved change required. |

## Real workflow recording

`juno-workflow.mp4` is a 21.88-second, silent H.264 recording of Juno's actual renderer sending a real request through its server and receiving a genuine provider reply. It uses the same UI-overhaul source `86b0f418` as the photographs. The renderer runs in a fresh Chrome profile against a separately launched, disposable Juno data directory following the real-runtime fixture pattern in `scripts/phase1-acceptance.ts`. The user's live Juno app and data are not used.

The recorded provider is the authenticated Codex CLI using `gpt-6-luna`, a model present in both its real catalog and Juno's existing approved model chain. The request is submitted through the real composer. No reply text, tool execution or completion event is injected. It demonstrates one conversation and a practical three-step answer, not browser/computer control or a coding task. This one take is not a performance benchmark.

Source material: `source-assets/workflow-recording.webm` (full original browser recording), `workflow-result.png` (actual completed UI), and `workflow-demo.json` (exact prompt, reply, model, conversation/message IDs and timing). The published recording trims only 3.64 seconds of initial loading and uses a fixed conversation close-up at x430 y500 w840 h500. Waiting and typing are not sped up. The 168,689-byte MP4 has no audio; WebVTT captions and an exact expandable transcript accompany it. The poster is the same crop of the real result screenshot. `scripts/record-workflow.mjs` records against the explicitly owned fixture described by `../juno-website-studio/live-demo.json`; it is a capture helper, not a website build dependency.

## Beta expectation sources

The Windows 11 x64 scope, unsigned-installer notice and invitation to a private GitHub prerelease are confirmed in the desktop repository's current `README.md` under Beta scope. Account sign-in and API-key options are confirmed in `src/product/setup/ProviderConnectPanel.tsx` and `src/product/ProviderSettings.tsx`. The website does not promise a response time, guaranteed invitation or included provider credits.

## Character artwork

The six `*-expressions.webp` files are lossless, transparent exports of the canonical recipes through the product's actual renderer and authored eye/mouth parts. Each nine-frame, 12-second loop blinks, smiles and glances; Prague and New York retain their characteristic smirk. This is an authored expression preview, not a runtime activity or completion signal. Combined size is 6,240 bytes. `source-assets/expressions.json` records every expression and hold; `scripts/export-motion.mjs` reproduces all six from the disposable source copy. All 16 standalone decorative orbs, the large Kyoto exhibit and selected companion portrait use these loops. Character-specific timing offsets prevent the cast from blinking in unison. The shared Pause characters control and exhibit/portrait controls pause the same character motion; they revert to the original PNG when paused, offscreen, backgrounded or reduced motion is enabled. The screenshot tour only cycles three existing authentic photographs; it does not manufacture product execution. The header uses the canonical Kyoto PNG with pixel rendering for stronger colours at its small size.

Six PNGs are deterministic exports of `CHARACTER_ORB_RECIPES` through Juno’s actual `renderOrbRgba` at 576 pixels, trimmed to transparent bounds. No image generation was used. Canonical identity and hues: Kyoto #B84A3A, Prague #7654AD, Lisbon #3567D6, Seoul #DC78A4, Toronto #6DB8CC, New York #D9B345. The refined Kyoto app icon is copied from Juno’s `public/app-icon.svg`, unchanged.

Names, personality lines and sample voices come from `shared/juno-characters.ts`; a copy of that portable profile data is retained in `source-assets/companions.json`. Personality quotations are authored character samples from the product, not testimonials.

Each photograph has optimized 960px, 1440px, and full-view WebP assets. Crops smaller than those target sizes keep their native resolution. The page uses responsive srcsets where the photographs are large, lazy loading below the hero, and full views only on request. `juno-social.png` is an original 1200×630 board composed of the actual character exports and type. `juno-outline.svg` traces the true Kyoto silhouette and face boundaries directly from its canonical 24-cell grid; it is used as the large closing watermark.

## Licensing and references

Juno artwork reuse is authorized by the owner’s website brief. The source repository identifies its license as Apache-2.0; its license and notice are retained alongside the source inventory. Geist 1.8.2 is self-hosted from its npm distribution; its OFL notice is `public/assets/Geist-LICENSE.txt`.

References inspected live: [Grok Bot](https://x.ai/bot), [MausBot](https://mausbot.com/), [ChatGPT download](https://chatgpt.com/download/). No reference-site logos, character art, screenshots, source code or proprietary media were copied.

## Capture incident and cleanup

The first demo-text writer imported a data module before assigning the fixture path, which added four orphaned messages to the default local database under a new fixture-only thread. The owner explicitly approved a guarded cleanup. The repair matched exactly those four IDs and the original new thread, removed them and its newly inserted thread state, and verified zero matching rows remained. Existing conversations were not edited. The corrected writer uses SQLite with the explicit disposable path. This issue did not change desktop source, release configuration or website runtime.
