import { supportFeed } from '../server/support.js';
export default async function handler(req, res) { if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end();
    return;
} try {
    const query = new URL(req.url, 'https://juno.tanishk.me').searchParams;
    const version = query.get('version');
    if (version && (!/^[A-Za-z0-9._-]{1,80}$/.test(version))) {
        res.statusCode = 400;
        res.end();
        return;
    }
    const feed = await supportFeed(version);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', feed.stale ? 'public,max-age=0,s-maxage=60' : 'public,max-age=0,s-maxage=300,stale-while-revalidate=900');
    res.end(JSON.stringify(feed));
}
catch {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ error: 'Approved support information is temporarily unavailable.' }));
} }
