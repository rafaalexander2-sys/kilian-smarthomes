/**
 * GET /api/reviews
 * Returns Google Place details (rating, review count, reviews).
 *
 * Required env vars (set in Vercel dashboard → Settings → Environment Variables):
 *   GOOGLE_PLACES_API_KEY  – key with "Places API" enabled
 *   GOOGLE_PLACE_ID        – place ID for Kilian Smart Homes
 *
 * How to get them:
 *   1. Go to https://console.cloud.google.com/
 *   2. Create a project → Enable "Places API (New)" or classic "Places API"
 *   3. Create an API key (restrict to your Vercel domain for safety)
 *   4. Find the Place ID:
 *      https://developers.google.com/maps/documentation/places/web-service/place-id
 *      Search "Kilian Smart Homes" on https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
 *   5. Set both in Vercel env vars
 */

export default async function handler(req, res) {
  const apiKey  = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return res.status(503).json({ error: 'Google Places env vars not set' });
  }

  const fields = 'name,rating,user_ratings_total,reviews';
  const url    = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&reviews_sort=newest&key=${apiKey}`;

  try {
    const gRes  = await fetch(url);
    const body  = await gRes.json();

    if (body.status !== 'OK') {
      return res.status(502).json({ error: body.status, detail: body.error_message });
    }

    // Cache for 6 hours on Vercel CDN
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=3600');
    return res.status(200).json(body.result);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
