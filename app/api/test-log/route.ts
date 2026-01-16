import { addEmailLog } from '../../../lib/db';

export async function GET() {
    const testLog = {
        timestamp: new Date().toISOString(),
        to: 'saidul.is.rajib@gmail.com',
        from: 'test@example.com',
        subject: '🧪 TEST LOG ENTRY',
        message: 'This is a test log entry to verify the logging system is working',
        ip: '127.0.0.1',
        ipLocation: 'Test Location',
        gpsLocation: 'Test GPS',
        userName: 'Test User',
        userEmail: 'test@example.com',
        device: 'Desktop',
        browser: 'Chrome',
        os: 'Windows',
        userAgent: 'Test User Agent',
        status: 'TEST'
    };

    await addEmailLog(testLog);

    console.log('🧪 Test log entry added successfully');

    return new Response(JSON.stringify({
        success: true,
        message: 'Test log added successfully. Go to admin dashboard and click Refresh to see it.',
        log: testLog
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
