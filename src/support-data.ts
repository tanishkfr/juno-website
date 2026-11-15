import { markdown } from './releases';
export type KnownIssue = {
    id: string;
    title: string;
    description: string;
    affectedVersions: string[];
    category?: string;
    status?: 'open' | 'limitation' | 'resolved';
    workaround?: string;
    severity?: string;
    fixedIn?: string;
    resolvedAt?: string;
};
export type SupportFeed = {
    latestPublishedTag: string | null;
    selectedTag: string | null;
    published: boolean;
    availableVersions: string[];
    available: boolean;
    issues: KnownIssue[];
    sourceUrl: string | null;
    stale: boolean;
    checkedAt: string;
    documents: Record<string, {
        body: string;
        version: string | null;
        sourceUrl: string;
    }>;
    preview?: boolean;
};
const target = document.querySelector<HTMLElement>('#known-issues-content');
const documentTarget = document.querySelector<HTMLElement>('#public-support-doc');
const make = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string) => { const n = document.createElement(tag); if (text)
    n.textContent = text; if (className)
    n.className = className; return n; };
function link(text: string, url: string) { const a = make('a', text); a.href = url; return a; }
function issueCard(issue: KnownIssue) { const article = make('article', undefined, 'known-issue'); article.id = 'issue-' + issue.id.replace(/[^a-z0-9_-]/gi, '-'); article.append(make('h2', issue.title)); const meta = make('div', undefined, 'issue-meta'); meta.append(make('span', 'Affected: ' + issue.affectedVersions.join(', '))); if (issue.status)
    meta.append(make('span', issue.status === 'limitation' ? 'Documented limitation' : issue.status === 'resolved' ? 'Resolved' : 'Open', 'issue-status')); if (issue.severity)
    meta.append(make('span', 'Severity: ' + issue.severity)); article.append(meta); const explanation = make('div', undefined, 'release-markdown'); explanation.append(markdown(issue.description)); article.append(explanation); if (issue.workaround) {
    const section = make('div', undefined, 'issue-workaround');
    section.append(make('h3', 'Workaround'), markdown(issue.workaround));
    article.append(section);
} if (issue.fixedIn)
    article.append(make('p', 'Fixed in ' + issue.fixedIn, 'issue-resolution')); if (issue.resolvedAt)
    article.append(make('p', 'Resolved ' + new Date(issue.resolvedAt).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }), 'issue-resolution')); return article; }
function renderKnown(feed: SupportFeed) {
    if (!target)
        return;
    target.replaceChildren();
    if (feed.stale)
        target.append(make('p', 'GitHub is temporarily unavailable. Showing recently retrieved approved public guidance.', 'support-notice'));
    const scope = make('div', undefined, 'support-version-bar');
    scope.append(make('p', feed.preview ? 'Preview only · ' + feed.selectedTag : 'Latest published release: ' + (feed.latestPublishedTag ?? 'none')));
    if (feed.availableVersions.length) {
        const label = make('label', 'View release ');
        const select = make('select');
        select.setAttribute('aria-label', 'Known issues release');
        if (feed.selectedTag && !feed.availableVersions.includes(feed.selectedTag)) {
            const o = make('option', feed.selectedTag + ' — guidance pending');
            o.value = feed.selectedTag;
            select.append(o);
        }
        for (const tag of feed.availableVersions) {
            const option = make('option', tag + (feed.preview ? ' — preview' : tag === feed.latestPublishedTag ? ' — latest published' : ' — archive'));
            option.value = tag;
            select.append(option);
        }
        select.value = feed.selectedTag ?? '';
        select.addEventListener('change', () => { location.href = '/known-issues/?version=' + encodeURIComponent(select.value); });
        label.append(select);
        scope.append(label);
    }
    target.append(scope);
    if (!feed.published && !feed.preview) {
        target.append(make('p', 'This release is not published. Its support presentation is not public yet.', 'support-notice'));
        return;
    }
    if (!feed.available) {
        target.append(make('p', 'No approved known-issues document is available for this release yet. This does not mean there are no known issues. Older release guidance is available from the version selector.', 'support-notice'));
        return;
    }
    if (feed.selectedTag !== feed.latestPublishedTag && !feed.preview)
        target.append(make('p', 'Archived guidance for ' + feed.selectedTag + '. These limitations are not assumed to apply to newer releases.', 'support-notice'));
    if (feed.sourceUrl)
        target.append(link('View the approved source on GitHub', feed.sourceUrl));
    const active = feed.issues.filter(i => i.status !== 'resolved'), resolved = feed.issues.filter(i => i.status === 'resolved');
    if (active.length) {
        for (const issue of active)
            target.append(issueCard(issue));
    }
    else
        target.append(make('p', 'No active issues are listed in this approved version of the document.', 'support-notice'));
    if (resolved.length) {
        const history = make('details', undefined, 'resolved-issues');
        history.append(make('summary', 'Resolved issues (' + resolved.length + ')'));
        for (const issue of resolved)
            history.append(issueCard(issue));
        target.append(history);
    }
}
function renderDocument(feed: SupportFeed) { if (!documentTarget)
    return; documentTarget.replaceChildren(); const doc = feed.documents[documentTarget.dataset.document ?? '']; if (!doc) {
    documentTarget.append(make('p', 'No approved public guide is available for this document yet.', 'support-notice'));
    return;
} documentTarget.append(make('h2', 'From the public GitHub guide')); const scope = doc.version === feed.selectedTag ? 'Guidance for ' + doc.version : doc.version ? 'Historical guidance for ' + doc.version + '; do not assume it applies to ' + feed.selectedTag : 'Unversioned public guidance; version applicability is not stated.'; documentTarget.append(make('p', scope, 'support-notice')); const details = make('details', undefined, 'public-document'); details.append(make('summary', 'Read the full public guide')); const body = make('div', undefined, 'release-markdown'); body.append(markdown(doc.body, doc.sourceUrl)); details.append(body, link('Original document on GitHub', doc.sourceUrl)); documentTarget.append(details); }
async function loadSupport() { if (!target && !documentTarget)
    return; try {
    let feed: SupportFeed;
    if (import.meta.env.DEV && new URLSearchParams(location.search).get('preview') === 'support') {
        feed = (await import('./support-preview')).supportPreview;
        document.body.insertAdjacentHTML('afterbegin', '<aside class="preview-banner" role="status">Support preview fixture · not a published release · public approval pending</aside>');
    }
    else {
        const version = new URLSearchParams(location.search).get('version');
        const response = await fetch('/api/support' + (version ? '?version=' + encodeURIComponent(version) : ''), { signal: AbortSignal.timeout(20000) });
        if (!response.ok)
            throw Error();
        feed = await response.json();
    }
    renderKnown(feed);
    renderDocument(feed);
}
catch {
    const n = target ?? documentTarget!;
    n.replaceChildren();
    const box = make('div', undefined, 'release-state');
    box.setAttribute('role', 'status');
    box.append(make('p', 'Approved support information is temporarily unavailable. No missing information is being presented as a clean bill of health.'));
    const retry = make('button', 'Retry support information', 'pill pill-white');
    retry.addEventListener('click', () => void loadSupport());
    box.append(retry, link('View public support documents on GitHub', 'https://github.com/tanishkfr/juno-beta'));
    n.append(box);
} }
void loadSupport();
