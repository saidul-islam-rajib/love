import { getEmailLogs, addEmailLog } from '../../../../lib/db';

export async function GET() {
    const logs = await getEmailLogs();

    const debugInfo = {
        totalLogs: logs.length,
        logs: logs,
        message: logs.length === 0
            ? 'No logs found. This means either no submissions yet, or different serverless instance.'
            : `Found ${logs.length} logs in this instance.`
    };

    return new Response(JSON.stringify(debugInfo, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function POST() {
    await addEmailLog({
        timestamp: new Date().toISOString(),
        to: 'test@example.com',
        from: 'debug@example.com',
        subject: 'DEBUG TEST',
        message: 'Debug test entry',
        ip: '127.0.0.1',
        ipLocation: 'Debug Location',
        gpsLocation: 'N/A',
        userName: 'Debug User',
        userEmail: 'debug@test.com',
        device: 'Desktop',
        browser: 'Chrome',
        os: 'Windows',
        userAgent: 'Debug',
        status: 'DEBUG'
    });

    const logs = await getEmailLogs();

    return new Response(JSON.stringify({
        success: true,
        message: 'Debug log added',
        totalLogs: logs.length
    }, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
