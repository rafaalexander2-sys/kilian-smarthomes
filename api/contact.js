/**
 * POST /api/contact
 * Receives the contact form and sends an email via Resend (or Nodemailer/SMTP).
 *
 * Required env vars:
 *   RESEND_API_KEY        – free tier at https://resend.com (100 emails/day free)
 *   CONTACT_TO_EMAIL      – email that receives the form (e.g. info@kiliansmarthomes.com)
 *
 * Alternative: swap the Resend block for any SMTP provider (SendGrid, Mailgun, etc.)
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email and message are required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || 'info@kiliansmarthomes.com';

  if (!apiKey) {
    // Log and return 200 so the form doesn't error in dev before configuring Resend
    console.log('[contact] no RESEND_API_KEY – would send:', { name, email, phone, message });
    return res.status(200).json({ ok: true, note: 'dev-mode, email not sent' });
  }

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    `Website Contact <noreply@kiliansmarthomes.com>`,
      to:      [toEmail],
      reply_to: email,
      subject: `New contact from ${name} – Kilian Smart Homes`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'not provided'}</p>
        <hr>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.json();
    return res.status(502).json({ error: err.message || 'Email send failed' });
  }

  return res.status(200).json({ ok: true });
}
