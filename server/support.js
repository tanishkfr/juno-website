import { releaseFeed, repository } from './releases.js';
const origin = 'https://raw.githubusercontent.com/' + repository + '/main/';
export function safeDocumentPath(path) { return typeof path === 'string' && /^(?:support\/[A-Za-z0-9._/-]+\.(?:md|json)|(?:KNOWN_ISSUES|INSTALL|PRIVACY|FEEDBACK)\.md)$/.test(path) && !path.split('/').includes('..') && !path.includes('//') && !path.includes('%'); }
export function declaredVersion(body) { const first = body.replace(/^\uFEFF/, '').split('\n').slice(0, 14).join(' '); const match = /\b(?:Juno\s+)?v?(\d+\.\d+\.\d+(?:-[a-z]+\.\d+)?)/i.exec(first); return match ? 'v' + match[1] : null; }
export function legacyIssues(body, tag) { const result = []; let current; let category = ''; for (const line of body.replaceAll('\r', '').split('\n')) {
    if (/^##\s/.test(line)) {
        if (current)
            result.push(current);
        current = null;
        category = line.replace(/^##\s+/, '');
        continue;
    }
    const start = /^(?:(\d+)\.|[-*])\s+(.+)/.exec(line);
    if (start && category) {
        if (current)
            result.push(current);
        current = { id: 'legacy-' + (start[1] ?? String(result.length + 1)), raw: start[2], category };
    }
    else if (current && line.trim())
        current.raw += ' ' + line.trim();
} if (current)
    result.push(current); return result.map(item => { const title = /^\*\*(.+?)\*\*\s*([\s\S]*)/.exec(item.raw); return { id: item.id, title: title ? title[1].replace(/[.]$/, '') : 'Documented limitation ' + item.id.slice(7), description: title ? title[2] || title[1] : item.raw, affectedVersions: [tag], category: item.category }; }); }
export function approvedVersions(manifest, published) { if (manifest?.schemaVersion !== 1 || !Array.isArray(manifest.versions))
    throw Error('Unsupported support manifest'); return manifest.versions.filter(v => v.approved === true && typeof v.releaseTag === 'string' && published.has(v.releaseTag) && safeDocumentPath(v.issuesPath)); }
export function structuredIssues(data, tag) { if (data?.schemaVersion !== 1 || data.releaseTag !== tag || !Array.isArray(data.issues))
    throw Error('Support version mismatch'); return data.issues.filter(i => typeof i.id === 'string' && typeof i.title === 'string' && typeof i.description === 'string' && Array.isArray(i.affectedVersions) && i.affectedVersions.every(v => typeof v === 'string')).map(i => { const out = { id: i.id, title: i.title, description: i.description, affectedVersions: i.affectedVersions }; if (['open', 'limitation', 'resolved'].includes(i.status))
    out.status = i.status; if (typeof i.workaround === 'string' && i.workaround.trim())
    out.workaround = i.workaround; if (typeof i.fixedIn === 'string' && i.fixedIn.trim())
    out.fixedIn = i.fixedIn; if (typeof i.resolvedAt === 'string' && Number.isFinite(Date.parse(i.resolvedAt)))
    out.resolvedAt = i.resolvedAt; if (['low', 'medium', 'high', 'critical'].includes(i.severity))
    out.severity = i.severity; if (typeof i.category === 'string')
    out.category = i.category; return out; }); }
const cache = new Map();
export async function publicDocument(path, fetcher = fetch) { if (!safeDocumentPath(path))
    throw Error('Unsafe support path'); const previous = cache.get(path); if (previous && Date.now() - previous.at < 300000)
    return { ...previous, stale: false }; try {
    const response = await fetcher(origin + path, { signal: AbortSignal.timeout(10000) });
    if (response.status === 404)
        return null;
    if (!response.ok)
        throw Error('Support service unavailable');
    const body = await response.text();
    if (body.length > 500000)
        throw Error('Support document too large');
    const record = { body, at: Date.now(), url: 'https://github.com/' + repository + '/blob/main/' + path };
    cache.set(path, record);
    return { ...record, stale: false };
}
catch (e) {
    if (previous && Date.now() - previous.at < 86400000)
        return { ...previous, stale: true };
    throw e;
} }
export async function supportFeed(version, options = {}) {
    const get = options.document ?? publicDocument;
    const feed = options.feed ?? await releaseFeed();
    const published = new Set(feed.releases.map(r => r.tag));
    const latest = feed.releases[0]?.tag ?? null;
    const selected = version || latest;
    const index = await get('support/index.json');
    const manifest = index ? JSON.parse(index.body) : null;
    const versions = manifest ? approvedVersions(manifest, published) : [];
    const legacy = await get('KNOWN_ISSUES.md');
    const legacyTag = legacy ? declaredVersion(legacy.body) : null;
    if (legacyTag && published.has(legacyTag) && !manifest?.versions.some(v => v.releaseTag === legacyTag) && !versions.some(v => v.releaseTag === legacyTag))
        versions.push({ releaseTag: legacyTag, issuesPath: 'KNOWN_ISSUES.md', approved: true });
    const record = versions.find(v => v.releaseTag === selected);
    const result = { latestPublishedTag: latest, selectedTag: selected, published: published.has(selected), availableVersions: versions.map(v => v.releaseTag), issues: [], documents: {}, sourceUrl: null, stale: feed.stale || index?.stale || false, checkedAt: new Date().toISOString(), available: false };
    if (!result.published)
        return result;
    if (record) {
        const doc = record.issuesPath === 'KNOWN_ISSUES.md' ? legacy : await get(record.issuesPath);
        if (doc) {
            result.issues = record.issuesPath.endsWith('.json') ? structuredIssues(JSON.parse(doc.body), selected) : declaredVersion(doc.body) === selected ? legacyIssues(doc.body, selected) : [];
            if (record.issuesPath.endsWith('.md') && declaredVersion(doc.body) !== selected)
                throw Error('Support version mismatch');
            result.sourceUrl = doc.url;
            result.stale ||= doc.stale;
            result.available = true;
        }
    }
    for (const kind of ['install', 'privacy', 'feedback']) {
        const path = record?.documents?.[kind] ?? kind.toUpperCase() + '.md';
        if (!safeDocumentPath(path))
            continue;
        const doc = await get(path);
        if (doc) {
            result.documents[kind] = { body: doc.body, version: declaredVersion(doc.body), sourceUrl: doc.url };
            result.stale ||= doc.stale;
        }
    }
    return result;
}
