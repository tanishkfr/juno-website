import './refresh.css';
import { createSky } from './sky';
import { loadReleases, installer, markdown, releaseSummary, type Release } from './releases';
const page = document.body.dataset.page;
if (page) {
    const sky = createSky(window.matchMedia("(prefers-reduced-motion: reduce)"), (_hour, night) => document.documentElement.classList.toggle("sky-night", night));
    window.addEventListener('scroll', () => { sky?.update(window.scrollY); document.querySelector('.site-header')?.classList.toggle('scrolled', window.scrollY > 48); }, { passive: true });
    const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
    const menu = document.querySelector<HTMLElement>('#mobile-nav')!;
    toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); menu.hidden = !open; });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) {
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
        toggle.focus();
    } });
    document.querySelectorAll<HTMLAnchorElement>('.desktop-nav a').forEach(a => { if (a.pathname === location.pathname)
        a.setAttribute('aria-current', 'page'); });
    document.querySelector('#footer-flight-toggle')?.parentElement?.remove();
}
const list = document.querySelector<HTMLElement>('#release-list'), download = document.querySelector<HTMLElement>('#download-release');
function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string) { const node = document.createElement(tag); if (text)
    node.textContent = text; if (className)
    node.className = className; return node; }
function link(text: string, url: string, className?: string) { const a = el('a', text, className); a.href = url; return a; }
const releasePath = (tag: string) => '/updates/?release=' + encodeURIComponent(tag) + (import.meta.env.DEV && new URLSearchParams(location.search).get('preview') === 'release' ? '&preview=release' : '');
const date = (r: Release) => new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(r.published));
function state(container: HTMLElement, text: string, retry = false) { container.replaceChildren(); const box = el('div', undefined, 'release-state'); box.setAttribute('role', 'status'); box.append(el('p', text)); if (retry) {
    const b = el('button', 'Try again', 'pill pill-white');
    b.type = 'button';
    b.addEventListener('click', () => void render());
    box.append(b);
} box.append(link('See published releases on GitHub', 'https://github.com/tanishkfr/juno-beta/releases')); container.append(box); }
function releaseArticle(r: Release, latest: boolean, detail: boolean) { const article = el('article', undefined, 'release-entry'); const meta = el('div', undefined, 'release-meta'); meta.append(el('span', r.tag, 'release-version')); const time = el('time', date(r)); time.dateTime = r.published; meta.append(time); if (latest)
    meta.append(el('span', r.id === 0 ? 'Preview fixture' : 'Newest published', 'release-badge')); if (r.prerelease)
    meta.append(el('span', 'Pre-release', 'release-kind')); const body = el('div', undefined, 'release-body'); const h = el('h2'); h.append(link(r.title, releasePath(r.tag))); body.append(h); const notes = el('div', undefined, 'release-markdown'); if(detail) notes.append(markdown(r.body)); else { const summary=releaseSummary(r.body); if(summary.intro) notes.append(markdown(summary.intro)); if(summary.bullets.length){const ul=el('ul');for(const bullet of summary.bullets){const li=el('li');li.append(markdown(bullet));ul.append(li);}notes.append(ul);} } if (!r.body.trim())
    notes.append(el('p', 'No release notes were supplied for this version.')); body.append(notes); const actions = el('div', undefined, 'release-actions'); actions.append(link(detail ? 'Original release on GitHub' : 'Read full release notes', detail ? r.url : releasePath(r.tag), detail ? undefined : 'pill pill-ghost')); const asset = installer(r); if (asset && latest)
    actions.append(link('Download ' + r.tag, asset.url, 'pill pill-white')); body.append(actions); article.append(meta, body); return article; }
async function render() { const container = list ?? download; if (!container)
    return; try {
    const feed = await loadReleases();
    container.replaceChildren();
    if (feed.stale)
        container.append(el('p', 'GitHub is temporarily unavailable. Showing recently retrieved published releases.', 'release-state'));
    if (list) {
        const selected = new URLSearchParams(location.search).get('release');
        if (selected) {
            const r = feed.releases.find(r => r.tag === selected);
            if (!r) {
                state(list, 'This release is not in the published release history.');
                return;
            }
            document.title = r.title + ' · Juno Updates';
            const back = link('← All releases', '/updates/', 'back-releases');
            list.append(back, releaseArticle(r, feed.releases[0]?.id === r.id, true));
            return;
        }
        if (!feed.releases.length) {
            state(list, 'No public releases are available yet. Draft releases stay private until they are published.');
            return;
        }
        let shown = 0;
        const more = el('button', 'Show more releases', 'pill pill-ghost release-more');
        more.type = 'button';
        const next = () => { const batch = feed.releases.slice(shown, shown + 8); batch.forEach((r, i) => list.insertBefore(releaseArticle(r, shown === 0 && i === 0, false), more)); shown += batch.length; more.hidden = shown >= feed.releases.length; };
        list.append(more);
        next();
    }
    else if (download) {
        const r = feed.releases[0];
        if (!r || !installer(r)) {
            state(download, 'There is no published Windows installer available right now. Upcoming drafts are not public downloads.');
            return;
        }
        const a = installer(r)!;
        download.append(el('p', r.tag + ' · Published ' + date(r), 'download-version'), link('Download for Windows', a.url, 'pill pill-white pill-big'), el('p', (a.size / 1048576).toFixed(1) + ' MB · ' + a.name, 'asset-meta'), link('Read the release notes', releasePath(r.tag)));
        const checksum = el('details', undefined, 'checksum');
        checksum.append(el('summary', 'Verify this download'));
        if (a.digest) {
            checksum.append(el('p', 'GitHub reports this SHA-256 digest:'), el('code', a.digest.slice(7)));
        }
        else {
            checksum.append(el('p', 'No SHA-256 digest was supplied by GitHub for this installer. Check the original release for a published checksum before installing.'));
            const checks = r.assets.filter(a => /sha256|checksum/i.test(a.name));
            for (const check of checks)
                checksum.append(link(check.name, check.url));
        }
        checksum.append(el('p', 'Compare it with the result of this PowerShell command:'), el('code', "Get-FileHash -Algorithm SHA256 -LiteralPath '.\\" + a.name.replaceAll("'", "''") + "'"));
        download.append(checksum);
    }
}
catch (error) {
    state(container, error instanceof Error ? error.message : 'Published releases are temporarily unavailable.', true);
} }
void render();
const supportCopy=document.querySelector<HTMLButtonElement>('#support-copy');
if(supportCopy){supportCopy.hidden=false;supportCopy.addEventListener('click',async()=>{const status=document.querySelector<HTMLElement>('#support-copy-status')!;const address=document.querySelector<HTMLElement>('#support-address')!;try{await navigator.clipboard.writeText(address.textContent!.trim());status.textContent='Email address copied.';}catch{const range=document.createRange();range.selectNodeContents(address);const selection=window.getSelection();selection?.removeAllRanges();selection?.addRange(range);status.textContent='Copy wasn’t available. The email address is selected so you can copy it manually.';}});}

import './support-data';

// Keep the footer orbit active only while its scene can be seen.
const footerOrbit = document.querySelector<HTMLElement>('.footer-mark');
if (footerOrbit) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const syncOrbit = () => footerOrbit.classList.toggle('flight-running', visible && !reduced.matches && !document.hidden);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncOrbit(); }, { threshold: 0.1 }).observe(footerOrbit);
    reduced.addEventListener('change', syncOrbit);
    document.addEventListener('visibilitychange', syncOrbit);
}
const capabilityRelease=document.querySelector<HTMLElement>('#capability-release');if(capabilityRelease){void loadReleases().then(feed=>{const latest=feed.releases[0];capabilityRelease.replaceChildren();if(!latest){capabilityRelease.textContent='No published release is available. Preview demonstrations are not downloads.';return;}const a=document.createElement('a');a.href='/updates/?release='+encodeURIComponent(latest.tag);a.textContent=latest.tag;capabilityRelease.append('Latest published release: ',a,'. Check its notes and limitations before installing.');if(feed.stale)capabilityRelease.append(' GitHub is temporarily unavailable; showing cached release data.');const version=/^v?(\d+)\.(\d+)/.exec(latest.tag);if(version&&(Number(version[1])>0||Number(version[2])>=5)){document.querySelectorAll('[data-v05-status]').forEach(n=>n.textContent='Beta · check release notes');}}).catch(()=>{capabilityRelease.textContent='Published release data is temporarily unavailable. Check Updates or GitHub before downloading.';});}
