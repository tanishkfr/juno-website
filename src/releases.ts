export type Asset = {
    name: string;
    url: string;
    size: number;
    digest: string | null;
};
export type Release = {
    id: number;
    tag: string;
    title: string;
    published: string;
    prerelease: boolean;
    body: string;
    url: string;
    assets: Asset[];
};
export type Feed = {
    releases: Release[];
    stale: boolean;
    fetchedAt: string;
};
export function safeAsset(url: string) { try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname === 'github.com' && u.pathname.startsWith('/tanishkfr/juno-beta/releases/download/') && !u.username && !u.password;
}
catch {
    return false;
} }
export const installer = (r: Release) => r.assets.find(a => /\.exe$/i.test(a.name) && !/(?:^|[-_])(?:full|offline|test)(?:[-_.]|$)/i.test(a.name) && safeAsset(a.url));
export async function loadReleases(): Promise<Feed> {
    if (import.meta.env.DEV && new URLSearchParams(location.search).get('preview') === 'release') {
        const { previewFeed } = await import('./release-preview');
        document.body.insertAdjacentHTML('afterbegin', '<aside class="preview-banner" role="status">Preview fixture · illustrative release notes · downloads disabled</aside>');
        return previewFeed;
    }
    const response = await fetch('/api/releases', { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
    if (!response.ok)
        throw Error('We couldn’t load published releases. Please try again.');
    const data = await response.json();
    if (!Array.isArray(data.releases))
        throw Error('The release service returned an unexpected response.');
    return data;
}
export function markdown(text: string) {
    const fragment = document.createDocumentFragment();
    let list: HTMLElement | null = null;
    let pre: HTMLElement | null = null;
    const inline = (node: HTMLElement, value: string) => { const re = /\[([^\]]+)\]\((https?:[^\s)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*/g; let at = 0; for (const match of value.matchAll(re)) {
        node.append(document.createTextNode(value.slice(at, match.index)));
        const el = document.createElement(match[1] ? 'a' : match[3] ? 'code' : 'strong');
        el.textContent = match[1] || match[3] || match[4];
        if (el instanceof HTMLAnchorElement) {
            try {
                const u = new URL(match[2]);
                if (!['https:', 'http:'].includes(u.protocol))
                    throw Error();
                el.href = u.href;
                el.rel = 'noopener noreferrer';
            }
            catch {
                el.removeAttribute('href');
            }
        }
        node.append(el);
        at = match.index! + match[0].length;
    } node.append(document.createTextNode(value.slice(at))); };
    for (const line of text.split('\n')) {
        if (line.startsWith('```')) {
            if (pre) {
                pre = null;
            }
            else {
                pre = document.createElement('pre');
                fragment.append(pre);
            }
            continue;
        }
        if (pre) {
            pre.append(document.createTextNode(line + '\n'));
            continue;
        }
        if (!line.trim()) {
            list = null;
            continue;
        }
        const heading = /^(#{1,6})\s+(.+)/.exec(line), item = /^\s*(?:[-*]|\d+\.)\s+(.+)/.exec(line);
        if (item) {
            if (!list) {
                list = document.createElement('ul');
                fragment.append(list);
            }
            const li = document.createElement('li');
            inline(li, item[1]);
            list.append(li);
        }
        else {
            list = null;
            const el = document.createElement(heading ? 'h' + Math.min(heading[1].length + 1, 6) : 'p');
            inline(el, heading ? heading[2] : line);
            fragment.append(el);
        }
    }
    return fragment;
}

/** Extract only source text; no generated changelog claims. */
export function releaseSummary(body:string):{intro:string;bullets:string[]}{
 const lines=body.replace(/\r\n/g,'\n').replace(/```[\s\S]*?```/g,'').split('\n');
 const shorten=(s:string,max:number)=>s.length>max?s.slice(0,max).trimEnd()+'…':s;
 const bullets=lines.flatMap(line=>{const m=/^\s*(?:[-*]|\d+\.)\s+(.+)/.exec(line);return m?[shorten(m[1],240)]:[];}).slice(0,3);
 const intro=lines.find(line=>line.trim()&&!/^\s*(?:#|[-*>]|\d+\.|!\[|<)/.test(line))?.trim()??'';
 return {intro:shorten(intro,340),bullets};
}
