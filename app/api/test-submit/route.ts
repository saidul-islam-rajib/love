import { addEmailLog, getAppConfig } from '../../../lib/db';

export async function GET() {
    try {
        const currentConfig = await getAppConfig();

        const testLog = {
            timestamp: new Date().toISOString(),
            to: "saidul.is.rajib@gmail.com",
            from: "test@example.com",
            subject: "💍 TEST SUBMISSION 💍",
            message: "This is a test submission to verify the database is working",
            ip: "127.0.0.1",
            ipLocation: "Test Location",
            gpsLocation: "Test GPS Location",
            userName: "Test User",
            userEmail: "test@example.com",
            device: "Desktop",
            browser: "Chrome",
            os: "Windows",
            userAgent: "Test User Agent",
            status: "TEST",
            configSnapshot: {
                title: currentConfig.title,
                description: currentConfig.description,
                successTitle: currentConfig.successTitle,
                successMessage: currentConfig.successMessage,
                requireEmail: currentConfig.requireEmail
            }
        };

        await addEmailLog(testLog);

        return new Response(JSON.stringify({
            success: true,
            message: "Test submission added successfully. Check admin dashboard.",
            log: testLog
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({
            success: false,
            error: err.message || 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}