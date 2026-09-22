import { NextRequest } from 'next/server';
import { getEmailLogs } from '../../../../lib/db';
import { isAuthorizedAdmin } from '../../../../lib/adminAuth';

export async function GET(req: NextRequest) {
    if (!isAuthorizedAdmin(req)) {
        return new Response(JSON.stringify({ error: 'Unauthorized', logs: [] }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const logs = await getEmailLogs();

        const formattedLogs = logs.map(log => ({
            timestamp: log.timestamp,
            to: log.to,
            from: log.from,
            subject: log.subject,
            message: log.message,
            ip: log.ip,
            location: log.gpsLocation && log.gpsLocation !== 'Permission denied or unavailable'
                ? `${log.ipLocation} | GPS: ${log.gpsLocation}`
                : log.ipLocation,
            userName: log.userName,
            userEmail: log.userEmail,
            device: log.device,
            browser: log.browser,
            os: log.os,
            userAgent: log.userAgent,
            status: log.status,
            configSnapshot: log.configSnapshot || null
        }));

        return new Response(JSON.stringify({ logs: formattedLogs }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Failed to read logs', logs: [] }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
