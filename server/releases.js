export const repository = 'tanishkfr/juno-beta';
export function assetUrl(value) { try {
    const u = new URL(value);
    return u.protocol === 'https:' && u.hostname === 'github.com' && u.pathname.startsWith('/' + repository + '/releases/download/') && !u.username && !u.password ? u.href : null;
}
catch {
    return null;
} }
export function publicReleases(input) {
    if (!Array.isArray(input))
        throw Error('Invalid release response');
    return input.filter(r => r && r.draft === false && typeof r.tag_name === 'string' && typeof r.published_at === 'string' && Number.isFinite(Date.parse(r.published_at))).map(r => ({ id: r.id, tag: r.tag_name, title: typeof r.name === 'string' && r.name ? r.name : r.tag_name, published: r.published_at, prerelease: r.prerelease === true, body: typeof r.body === 'string' ? r.body : '', url: 'https://github.com/' + repository + '/releases/tag/' + encodeURIComponent(r.tag_name), assets: (Array.isArray(r.assets) ? r.assets : []).filter(a => a.state === 'uploaded' && assetUrl(a.browser_download_url)).map(a => ({ name: String(a.name), url: assetUrl(a.browser_download_url), size: Number.isFinite(a.size) ? a.size : 0, digest: typeof a.digest === 'string' && /^sha256:[a-f0-9]{64}$/i.test(a.digest) ? a.digest : null })) })).sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
}
let cache;
let pending;
export async function releaseFeed(fetcher = fetch) {
    if (cache && Date.now() - cache.at < 300000)
        return { ...cache.data, stale: false };
    if (pending)
        return pending;
    pending = (async () => { try {
        const all = [];
        for (let page = 1; page <= 10; page++) {
            const response = await fetcher('https://api.github.com/repos/' + repository + '/releases?per_page=100&page=' + page, { headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'Juno-website' }, signal: AbortSignal.timeout(10000) });
            if (!response.ok)
                throw Error('Release service unavailable');
            const chunk = await response.json();
            all.push(...publicReleases(chunk));
            if (chunk.length < 100)
                break;
        }
        const data = { releases: all.sort((a, b) => Date.parse(b.published) - Date.parse(a.published)), fetchedAt: new Date().toISOString() };
        cache = { at: Date.now(), data };
        return { ...data, stale: false };
    }
    catch (e) {
        if (cache && Date.now() - cache.at < 86400000)
            return { ...cache.data, stale: true };
        throw e;
    }
    finally {
        pending = undefined;
    } })();
    return pending;
}
