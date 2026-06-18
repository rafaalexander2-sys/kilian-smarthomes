/**
 * GET /api/instagram
 * Returns latest 12 Instagram posts.
 *
 * Required env vars (set in Vercel dashboard → Settings → Environment Variables):
 *   INSTAGRAM_ACCESS_TOKEN  – long-lived User Access Token from Meta for Developers
 *
 * How to get the token:
 *   1. Go to https://developers.facebook.com/apps/
 *   2. Create an app → "Consumer" type
 *   3. Add "Instagram Basic Display" product
 *   4. Generate a User Token for your Instagram account
 *   5. Exchange for a long-lived token (valid 60 days, auto-refreshed below)
 *   6. Paste in Vercel env vars as INSTAGRAM_ACCESS_TOKEN
 */

export default async function handler(req, res) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return res.status(503).json({ error: 'INSTAGRAM_ACCESS_TOKEN not set' });
  }

  const fields = 'id,media_type,media_url,thumbnail_url,permalink,timestamp';
  const url    = `https://graph.instagram.com/me/media?fields=${fields}&limit=12&access_token=${token}`;

  try {
    const igRes  = await fetch(url);
    const data   = await igRes.json();

    if (data.error) {
      return res.status(502).json({ error: data.error.message });
    }

    // Cache for 1 hour on Vercel CDN
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
