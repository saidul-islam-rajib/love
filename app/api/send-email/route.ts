import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const subject = body.subject || 'No subject';
    const message = body.message || '';
    const to = body.to || process.env.TO_EMAIL;

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const from = process.env.SENDGRID_FROM || process.env.SMTP_FROM || 'no-reply@example.com';

    if (!SENDGRID_API_KEY) {
      try {
        const logDir = process.cwd();
        const logPath = process.env.EMAIL_DEV_LOG || path.join(logDir, 'sent-emails.log');
        const entry = `[${new Date().toISOString()}] TO: ${to} FROM: ${from} SUBJECT: ${subject}\n${message}\n\n`;
        await fs.appendFile(logPath, entry, { encoding: 'utf8' });
        console.warn('SENDGRID_API_KEY not set — email written to', logPath);
        return new Response(JSON.stringify({ ok: true, note: `dev: logged to ${logPath}` }), { status: 200 });
      } catch (err) {
        console.error('Failed to write dev email log', err);
        return new Response(JSON.stringify({ error: 'Missing SENDGRID_API_KEY and failed to write dev log.' }), { status: 500 });
      }
    }
    if (!to) {
      return new Response(JSON.stringify({ error: 'No recipient provided. Set TO_EMAIL or pass `to` in the request body.' }), { status: 400 });
    }

    const payload = {
      personalizations: [
        {
          to: [{ email: to }],
          subject,
        },
      ],
      from: { email: from },
      content: [
        { type: 'text/plain', value: message },
        { type: 'text/html', value: `<pre style="white-space:pre-wrap">${escapeHtml(message)}</pre>` },
      ],
    };

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('sendgrid error', res.status, text);
      return new Response(JSON.stringify({ error: `SendGrid error: ${res.status} ${text}` }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('send-email error', err);
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500 });
  }
}

function escapeHtml(s: string) {
  return String(s || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
