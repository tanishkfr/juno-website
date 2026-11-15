# Juno website v0.5 refresh — preview handoff

15 November 2026. Website-only work on codex/website-v05-refresh, preserving the existing pixel sky, palette, typography and six companions. The starting tree at 6f30f89 matches production main 85104c4. No desktop source, installed profile, installer, release asset, draft release, checksums or signed update feed were changed.

## What is ready

- Split navigation joins into compact chrome after scrolling. Product messaging describes a local-first Windows workspace, Code and bounded Mission work. Literal sun/moon shapes are removed while original lighting, clouds and scroll palette progression remain.
- Interactive current-renderer Conversation/Code/Mission showcase. Four hidden Electron captures use a disposable profile, synthetic records and a website-owned Vite cache. They do not demonstrate provider execution. See source-assets/v05/provenance.json. The owner's Juno window was not controlled.
- /updates/ discovers all published public GitHub releases, including prereleases. Each summary contains up to three original source bullets and a full-note button. Full notes use the entire release body, including headings, lists, code and safe links. Release-detail links use ?release=tag. History loads in groups of eight. The requested Notes section has been removed entirely.
- /download/ selects the standard Windows executable from the newest eligible published release; full/offline/test variants are excluded. Version, publication date, asset name, size, URL and GitHub SHA-256 digest are data-driven. If no digest exists, the original release and checksum assets are linked; no digest is invented.
- /help/, /privacy/ and /support/ provide installation, permissions, provider and manual-update guidance. Support uses the owner's real email, editable email draft, copy button and denied-clipboard manual fallback. No response-time promise. Aria's /support was inspected headlessly as a structural reference; none of its artwork or text is shipped.
- On secondary pages, the WebGL pattern spans the full content height and ends at the Good work footer. A ResizeObserver follows fetched history and expanded content.

## Release integration

api/releases.js calls server/releases.js. Only unauthenticated public GitHub GET requests go to tanishkfr/juno-beta. No /releases/latest dependency and no private token. Responses are cached for five minutes; a process-local successful public result can be served stale for up to 24 hours on upstream failure. Vercel also applies short shared caching. A cold instance with no good cache returns 503, and the UI provides Retry and the original public releases page. Download URLs must be HTTPS GitHub URLs inside this repository's releases/download path.

Normal publication requires no website edit or deployment: publish the qualified GitHub release, then allow cache revalidation. Drafts and records without publication dates are excluded. New beta/prerelease assets are eligible. Creation/build dates are not substituted for publication dates. There is no release-write API.

Local preview-only fixture: /updates/?preview=release and /download/?preview=release. It is explicitly labelled and has no installer asset. The fixture module is removed by production compilation. Published v0.4.2 and older releases are available from the real API at the time of verification; v0.5 remains absent while draft.

The website release feed is independent of the app's existing signed update-announcement feed. Signing and release publication remain separate owner-controlled steps. juno-beta documentation and releases are deliberately untouched during DeepSeek's qualification work.

## Verification

- Strict TypeScript and Vite multipage production build.
- Four release-data unit tests: draft exclusion, eligible prereleases, hostile URL rejection, pagination/cache and source-derived summary limits.
- Headless Chromium at 1440, 390 and 320px across all six pages; no horizontal overflow, broken loaded images, WCAG A/AA axe violations or runtime exceptions.
- Six companions, new showcase keyboard navigation, full-size gallery, release-detail navigation, historical notes, future-release formatting, inert raw HTML, API outage retry and support clipboard-denial fallback. Clipboard access was stubbed; no email was sent.
- Secondary-page canvas/footer bounds checked geometrically. Evidence: evidence/v05-refresh/receipt.json and screenshots.
- Impeccable detector warnings refer to the inherited Geist family, approved pixel-wordmark text styling and an unresolved-CSS false type hierarchy; actual rendered hierarchy and contrast were checked.

## Remaining integration and media boundaries

The main v0.5 workspace, Code and Mission planner media are current. The optional genuine provider video and auxiliary controls/Teams/Orb Studio captures remain visibly labelled as earlier-beta media. No fresh provider, Mission execution or Ariadne outcome footage is claimed; these can be replaced after DeepSeek's final artifact qualification without changing release synchronization.

Do not promote the preview or publish any release until the owner approves. No physical-phone, Firefox or Safari verification is claimed. This is website QA, not installer/runtime qualification.


## Additional GitHub-backed support — 15 November 2026

Added /known-issues/ and /uninstall/, plus /api/support. Approved version records in the proposed public support/index.json must match a published GitHub release. The endpoint reads public files only; a draft version never returns issue data. Until the manifest is approved and published in juno-beta, the existing root KNOWN_ISSUES.md is parsed only under its own declared v0.4.2 release. Current public Install names v0.4.2; Privacy and Feedback name v0.4.1 and are shown as historical guides, not silently relabelled for v0.5.

Issue title, explanation and affected versions come from the public source. Status, workaround, severity, fixed-in version and resolution date are shown only when explicitly supplied. Resolved structured records leave the active list but remain available in a historical disclosure. A newly published version without approved guidance shows pending, not old limitations or an empty healthy list.

Public Markdown/JSON files are fetched from the fixed public raw GitHub repository with five-minute process caches; Vercel applies five-minute shared caching, so changes may require roughly ten minutes plus GitHub cache propagation. A successful public document can be served stale for up to 24 hours on outage, visibly labelled; a cold failure shows retry. No token or private repository is involved. Marked and DOMPurify now provide full sanitized GFM tables, ordered lists, links and code blocks for both release notes and support documents. Remote image/media loading is intentionally suppressed.

Eight additional unit tests verify path restrictions, draft gating, version separation, explicit metadata, automatic refresh/stale behavior and legacy Markdown. Headless support QA covers desktop/390/320px, current public content, v0.5 dev-only fixture, pending guidance, resolved history, outages and expanded installation tables. Screenshots and receipt: evidence/v05-support/. The original refreshed-page suite also passes after the shared Markdown change.

The current NSIS configuration/custom uninstall hook and public INSTALL.md were inspected read-only: removal of application/registration is separate from intentional local data deletion. /uninstall/ contains no destructive commands. No fresh live uninstall was run, and no final-build qualification is claimed on behalf of DeepSeek.

proposed-public-support/ contains a preserved public v0.4.2 archive, a versioned manifest, three confirmed general v0.5 limitations and draft Install/Privacy/Feedback copy. The v0.5 record is approved:false. It is deliberately partial and must be reconciled with DeepSeek’s final corrected build and approved before any public distribution-repository update. It contains no machine-specific private findings. Nothing in juno-beta, the draft release, its assets, checksums or signed feed was edited. The website runtime and preview can be completed independently; publishing the approved public support files is the remaining coordination step.

The explicit approved:false manifest flag also blocks legacy fallback for that version; a matching root Markdown file cannot bypass pending approval. Total data tests now pass: 12.

## Visual refinement follow-up

Removed the obsolete workflow video and hero companion bar. Conversation, project workspace (Files panel), and Code now use distinct current-renderer images with working full-size dialogs. Pixel luminance and opacity are reduced for reading contrast. The home footer matches the solid Updates footer, with a static companion composition and no background pattern. Release pagination has 32px separation from the final divider (24px on small screens). Headless checks cover 1440/1280/390/320px, all three images/dialogs, accessibility and no overflow; evidence/visual-polish contains focused screenshots and receipt. Existing refresh regression suite and all 12 data tests pass.


## Distinct current-renderer media
Replaced the four earlier-beta feature screenshots with fresh current renderer captures: composer options, Mission planner, recorded Mission history, and Code approval. Presentation crops focus the controls, while enlargement preserves the full untouched capture. New populated conversation image replaces the empty Conversation view. Removed the duplicate opening workflow gallery and repeated standalone Code gallery; the main three-view product tour remains. Navbar selection dot removed. Captures use an isolated hidden Electron window and synthetic fixture records; no installed profile, provider execution, release artifact or desktop source edits. Source captures and provenance: source-assets/v05-next/.
Added /about/ and /capabilities/ with shared desktop/mobile navigation and footer links. Capabilities distinguishes core beta, provider-dependent and v0.5 preview demonstrations; latest release comes from the public release API, with preview labels updating when a v0.5-or-later release is published. No unsupported roadmap is promised. QA: both routes at 1440/1000/800/390/320px, Axe WCAG A/AA, no overflow, navigation/current states and simulated published-v0.5 label rollover pass. Screenshots: evidence/about-capabilities/.
