import fs from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
        const logPath = process.env.EMAIL_DEV_LOG || path.join(process.cwd(), 'sent-emails.log');

        // Check if log file exists
        try {
            await fs.access(logPath);
        } catch {
            return new Response(JSON.stringify({ logs: [] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Read the log file
        const logContent = await fs.readFile(logPath, 'utf-8');

        // Parse the logs
        const logs = parseLogFile(logContent);

        return new Response(JSON.stringify({ logs }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error('Error reading logs:', err);
        return new Response(JSON.stringify({ error: 'Failed to read logs', logs: [] }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function parseLogFile(content: string) {
    const logs: any[] = [];
    const entries = content.split(/\n\n+/).filter(entry => entry.trim());

    for (const entry of entries) {
        try {
            const lines = entry.split('\n').filter(l => l.trim());

            // Parse each field
            let timestamp = '';
            let to = '';
            let from = '';
            let subject = '';
            let ip = '';
            let ipLocation = '';
            let gpsLocation = '';
            let userEmail = '';
            let device = '';
            let browser = '';
            let os = '';
            let userAgent = '';
            let status = '';
            let message = '';

            let isMessage = false;

            for (const line of lines) {
                if (line.startsWith('[')) {
                    // First line with timestamp
                    const timestampMatch = line.match(/\[(.*?)\]/);
                    if (timestampMatch) timestamp = timestampMatch[1];

                    const toMatch = line.match(/TO:\s*([^\s]+)/);
                    if (toMatch) to = toMatch[1];

                    const fromMatch = line.match(/FROM:\s*([^\s]+)/);
                    if (fromMatch) from = fromMatch[1];

                    const subjectMatch = line.match(/SUBJECT:\s*(.+?)(?:\s+USER_AGENT:|$)/);
                    if (subjectMatch) subject = subjectMatch[1].trim();

                    // Old format - USER_AGENT and IP on first line
                    const userAgentMatch = line.match(/USER_AGENT:\s*(.+?)(?:\s+IP:|$)/);
                    if (userAgentMatch) userAgent = userAgentMatch[1].trim();

                    const ipMatch = line.match(/IP:\s*(.+?)$/);
                    if (ipMatch) ip = ipMatch[1].trim();
                } else if (line.startsWith('IP:')) {
                    ip = line.replace('IP:', '').trim();
                } else if (line.startsWith('IP_LOCATION:')) {
                    ipLocation = line.replace('IP_LOCATION:', '').trim();
                } else if (line.startsWith('GPS_LOCATION:')) {
                    gpsLocation = line.replace('GPS_LOCATION:', '').trim();
                } else if (line.startsWith('USER_EMAIL:')) {
                    userEmail = line.replace('USER_EMAIL:', '').trim();
                } else if (line.startsWith('DEVICE:')) {
                    device = line.replace('DEVICE:', '').trim();
                } else if (line.startsWith('BROWSER:')) {
                    browser = line.replace('BROWSER:', '').trim();
                } else if (line.startsWith('OS:')) {
                    os = line.replace('OS:', '').trim();
                } else if (line.startsWith('USER_AGENT:')) {
                    userAgent = line.replace('USER_AGENT:', '').trim();
                } else if (line.startsWith('STATUS:')) {
                    status = line.replace('STATUS:', '').trim();
                } else if (line.startsWith('MESSAGE:')) {
                    isMessage = true;
                    message = line.replace('MESSAGE:', '').trim();
                } else if (isMessage && !line.startsWith('[')) {
                    message += '\n' + line;
                } else if (!isMessage && !line.startsWith('[') && !line.includes(':')) {
                    // Old format - message is just text after first line
                    message += (message ? '\n' : '') + line;
                }
            }

            if (timestamp && to) {
                const location = gpsLocation && gpsLocation !== 'Permission denied or unavailable'
                    ? `${ipLocation || 'Unknown'} | GPS: ${gpsLocation}`
                    : ipLocation || 'Unknown';

                logs.push({
                    timestamp,
                    to,
                    from: from || 'N/A',
                    subject: subject || 'No subject',
                    message: message.trim() || 'No message',
                    ip: ip || 'Unknown',
                    location: location,
                    userEmail: userEmail || 'Not provided',
                    device: device || 'Unknown',
                    browser: browser || 'Unknown',
                    os: os || 'Unknown',
                    userAgent: userAgent || 'Unknown',
                    status: status || 'LOGGED'
                });
            }
        } catch (err) {
            console.error('Error parsing log entry:', err);
        }
    }

    // Return logs in reverse order (newest first)
    return logs.reverse();
}
