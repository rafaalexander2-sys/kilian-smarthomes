/**
 * GET /api/instagram
 * Returns latest 12 Instagram posts via Instagram Graph API.
 *
 * Required env vars (Vercel dashboard → Settings → Environment Variables):
 *   INSTAGRAM_USER_ID      – numeric ID do perfil Instagram Business/Creator
 *   INSTAGRAM_ACCESS_TOKEN – long-lived Page Access Token (não expira com System User)
 *
 * Passo a passo para gerar os tokens: veja o guia no README ou siga as instruções
 * que o Claude enviou no chat.
 */

export default async function handler(req, res) {
  const token  = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    return res.status(503).json({ error: 'INSTAGRAM env vars not set' });
  }

  const fields = 'id,media_type,media_url,thumbnail_url,permalink,timestamp';
  const url = `https://graph.facebook.com/v21.0/${userId}/media?fields=${fields}&limit=12&access_token=${token}`;

  try {
    const igRes = await fetch(url);
    const data  = await igRes.json();

    if (data.error) {
      return res.status(502).json({ error: data.error.message });
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
