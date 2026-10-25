# Juno refinement review

26 October 2026 · Website-only changes · Baseline `60dd3a9`

Project: `C:\Dev\Projects\Juno\backups\juno-website`

Branch: `codex/website-refinement`

## Comparison and decisions

The strongest lesson from [Grok Bot](https://x.ai/bot) is the relationship between a clear task story, a large product image, and a recognizable character. The owner's supplied dark-section references remain the visual authority. [MausBot](https://mausbot.com/) makes its intended tasks and setup concrete through specific examples. [ChatGPT's desktop page](https://chatgpt.com/download/) provides a useful reference for restrained copy and a clear relationship between type and product imagery.

This pass inspected the rendered Juno site at laptop and phone sizes, captured MausBot live, and refreshed all three reference pages through web retrieval. Grok Bot blocked the fresh headless Chrome visit with Cloudflare, and the fresh ChatGPT headless capture was blank. Those two captures are recorded as limits, not successful visual audits. Their visual comparison uses the owner's screenshots and the earlier rendered reference captures already retained in `evidence/reference-browser/`. No challenge bypass, proprietary assets, or reference source code was used.

| Observed weakness in Juno | Implemented refinement |
| --- | --- |
| The first product image was an empty workspace; the hero's copy did not state local-first or Windows directly. | The hero now explains the product plainly and opens on the real conversation with Kyoto. Illustrative text is still labeled. |
| A second large conversation section repeated the same story later in the page. | A three-view Conversation / Workspace / Code preview replaces that repetition. All three views use the existing genuine captures. |
| Desktop screenshots remained too small to inspect in the phone's enlarged view. | Added actual-size inspection, fit restoration, native panning, content-focused starting positions, loading feedback, and a dismissible failure state. |
| Header links gave no current-location feedback. | Navigation now marks the current section visually and with `aria-current`. |
| Feature headings were more abstract than the product controls they introduced. | Tightened the Computer, Routines, and Results headings around access, scheduling, and saved work. |
| Teams repeated its heading and explanation before showing a tiny configuration image on mobile. | The real configuration image comes first on mobile, followed by a concise, explicitly illustrative three-companion role breakdown. |
| Some screenshot framing and spacing made the page longer than its content justified. | Removed the repeated section, tightened the hero and companion spacing, and reduced blank vertical space in the Code photograph. |

The heavier Juno wordmark, monochrome Private beta link, four dark feature panels, oversized Kyoto exhibit, six canonical companions, and large outline close remain intact. The page keeps Juno's own artwork and product qualifications.

## Observed before and after

With all imagery loaded, the page measured 10,771 pixels high at 1366px before this pass and 9,375 pixels afterwards. At 390px it moved from 10,551 to 9,608 pixels. These are local layout measurements, not performance benchmarks. They reflect the removal of repeated material while retaining the product areas in the brief.

Before captures: `evidence/refinement-before/`. After captures: `evidence/refinement-after/`, plus the refreshed five-viewport screenshots in `evidence/`. The initial screenshot, all preview variants, the real Teams controls, the Code frame, and the phone image viewer were visually inspected. No new application captures or desktop mutations were needed during this refinement.

## Verification

- Production build and strict TypeScript checking pass.
- The built page passes at 1920×1080, 1366×768, 834×1112, 390×844, and 320×740. Each viewport records the same built module URL in `evidence/verification.json`.
- No page overflow, broken loaded images, invalid internal anchors, runtime exceptions, or failing normal website resource requests were observed.
- Axe reports zero A/AA violations in the tested page DOM. This is automated coverage, not a complete accessibility certification of the website or the application shown inside its photographs.
- Preview tabs and arrow keys; six companion selections; four feature photographs; modal forward/backward Tab, Escape and focus return; mobile navigation; current-section marking; the availability link; actual-size and fit-view controls; intentional image-load failure; reduced motion; and core content without JavaScript pass.
- Dependency audit reports zero vulnerabilities. No dependencies or backend services were added.

The application JavaScript is about 3.25 KB compressed. The inspection controls add roughly 1.15 KB compared with the earlier implementation; they make the screenshots usable at their native detail rather than adding decorative motion.

## Performance

The scoped mobile audit at `evidence/lighthouse-refinement-mobile-scoped.json` reports performance **96**, accessibility **100**, SEO **100**, FCP **1.8 s**, LCP **2.4 s**, blocking time **0 ms**, and layout shift **0**. Best practices scores 81 on this local HTTP origin.

As in the earlier handoff, this measurement excludes the antivirus-injected `kaspersky-labs.com` host only from Lighthouse's test-browser requests. Antivirus settings are unchanged, and the earlier unfiltered evidence is retained. This is a simulated mobile lab result for the local production build, not a public field-performance claim or a controlled speed comparison with competitors.

## Boundaries

Only the independent website and its evidence were changed. The Juno desktop source, releases, user data, installation, and provider configuration were not accessed for mutations in this pass. No public deployment or remote push was made. Actual external model execution, computer/browser work, research output and team delegation remain outside this website verification. Firefox, Safari and physical-device testing remain unverified.
