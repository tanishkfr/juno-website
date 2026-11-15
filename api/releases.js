import { releaseFeed } from '../server/releases.js';
export default async function handler(req, res) { if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end();
    return;
} try {
    const feed = await releaseFeed();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', feed.stale ? 'public, max-age=0, s-maxage=60' : 'public, max-age=0, s-maxage=300, stale-while-revalidate=900');
    res.end(JSON.stringify(feed));
}
catch {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ error: 'Published releases are temporarily unavailable.' }));
} }
