import {marked} from 'marked';
import DOMPurify from 'dompurify';
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
export function markdown(text:string,sourceUrl='https://github.com/tanishkfr/juno-beta/blob/main/') {
 const html=marked.parse(text.replace(/^[\u200B-\u200F\uFEFF]/,''),{async:false,gfm:true});
 const fragment=DOMPurify.sanitize(html,{USE_PROFILES:{html:true},FORBID_TAGS:['img','video','audio','iframe','style','form','input','button'],FORBID_ATTR:['style','id','name','class','target'],RETURN_DOM_FRAGMENT:true});
 for(const a of fragment.querySelectorAll('a')){const href=a.getAttribute('href');if(!href)continue;try{const url=new URL(href,sourceUrl);if(!['https:','http:','mailto:'].includes(url.protocol))throw Error();a.href=url.href;a.rel='noopener noreferrer';}catch{a.removeAttribute('href');}}
 for(const heading of fragment.querySelectorAll('h1,h2,h3,h4,h5,h6')){const level=Math.min(Number(heading.tagName.slice(1))+1,6);const replacement=document.createElement('h'+level);replacement.append(...heading.childNodes);heading.replaceWith(replacement);}
 for(const table of fragment.querySelectorAll('table')){const region=document.createElement('div');region.className='markdown-table';region.tabIndex=0;region.setAttribute('role','region');region.setAttribute('aria-label','Release or support table');table.replaceWith(region);region.append(table);}
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
