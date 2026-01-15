import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const subject = body.subject || 'No subject';
    const message = body.message || '';
    const to = body.to || process.env.TO_EMAIL;
    const userEmail = body.userEmail || null;
    const gpsLocation = body.gpsLocation || { latitude: 'N/A', longitude: 'N/A', accuracy: 'N/A' };

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const from = process.env.SENDGRID_FROM || process.env.SMTP_FROM || 'no-reply@example.com';

    // Get user agent and IP for logging
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0].trim() || realIp || 'Unknown';

    // Get additional device/browser info
    const deviceInfo = parseUserAgent(userAgent);

    // Get location from IP (using free ipapi.co service)
    let locationInfo = 'Unknown';
    if (ip !== 'Unknown' && ip !== '::1' && !ip.startsWith('127.')) {
      try {
        const locationRes = await fetch(`https://ipapi.co/${ip}/json/`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (locationRes.ok) {
          const locationData = await locationRes.json();
          locationInfo = `${locationData.city || 'Unknown'}, ${locationData.region || ''}, ${locationData.country_name || 'Unknown'}`;
        }
      } catch (err) {
        console.error('Failed to get location:', err);
      }
    }

    // Format GPS location
    const gpsInfo = gpsLocation.latitude !== 'N/A'
      ? `${gpsLocation.latitude}, ${gpsLocation.longitude} (accuracy: ${gpsLocation.accuracy}m)`
      : 'Permission denied or unavailable';

    if (!SENDGRID_API_KEY) {
      try {
        const logDir = process.cwd();
        const logPath = process.env.EMAIL_DEV_LOG || path.join(logDir, 'sent-emails.log');
        const entry = `[${new Date().toISOString()}] TO: ${to} FROM: ${from} SUBJECT: ${subject}
IP: ${ip}
IP_LOCATION: ${locationInfo}
GPS_LOCATION: ${gpsInfo}
USER_EMAIL: ${userEmail || 'Not provided'}
DEVICE: ${deviceInfo.device}
BROWSER: ${deviceInfo.browser}
OS: ${deviceInfo.os}
USER_AGENT: ${userAgent}
MESSAGE: ${message}

`;
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

    // Log successful email send
    try {
      const logDir = process.cwd();
      const logPath = process.env.EMAIL_DEV_LOG || path.join(logDir, 'sent-emails.log');
      const entry = `[${new Date().toISOString()}] TO: ${to} FROM: ${from} SUBJECT: ${subject}
IP: ${ip}
IP_LOCATION: ${locationInfo}
GPS_LOCATION: ${gpsInfo}
USER_EMAIL: ${userEmail || 'Not provided'}
DEVICE: ${deviceInfo.device}
BROWSER: ${deviceInfo.browser}
OS: ${deviceInfo.os}
USER_AGENT: ${userAgent}
STATUS: SENT_VIA_SENDGRID
MESSAGE: ${message}

`;
      await fs.appendFile(logPath, entry, { encoding: 'utf8' });
    } catch (logErr) {
      console.error('Failed to log sent email', logErr);
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('send-email error', err);
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500 });
  }
}

function parseUserAgent(ua: string) {
  // Detect device type
  let device = 'Desktop';
  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet';

  // Detect browser
  let browser = 'Unknown';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  // Detect OS
  let os = 'Unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac os/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS';

  return { device, browser, os };
}

function escapeHtml(s: string) {
  return String(s || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
