import { addEmailLog } from '../../../lib/db';

export async function GET() {
    try {
        console.log('🧪 Creating test submission...');

        const testLog = {
            timestamp: new Date().toISOString(),
            to: 'saidul.is.rajib@gmail.com',
            from: 'test@example.com',
            subject: '💍 TEST SUBMISSION 💍',
            message: 'This is a test submission to verify the database is working',
            ip: '127.0.0.1',
            ipLocation: 'Test Location',
            gpsLocation: 'Test GPS Location',
            userName: 'Test User',
            userEmail: 'test@example.com',
            device: 'Desktop',
            browser: 'Chrome',
            os: 'Windows',
            userAgent: 'Test User Agent',
            status: 'TEST'
        };

        await addEmailLog(testLog);

        console.log('✅ Test submission added successfully');

        return new Response(JSON.stringify({
            success: true,
            message: 'Test submission added successfully. Check admin dashboard.',
            log: testLog
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error('❌ Test submission failed:', err);
        return new Response(JSON.stringify({
            error: 'Test submission failed',
            message: err.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}