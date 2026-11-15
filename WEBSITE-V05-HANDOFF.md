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
