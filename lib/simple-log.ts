interface EmailLog {
    timestamp: string;
    to: string;
    from: string;
    subject: string;
    message: string;
    ip: string;
    ipLocation: string;
    gpsLocation: string;
    userName: string;
    userEmail: string;
    device: string;
    browser: string;
    os: string;
    userAgent: string;
    status: string;
}

// Simple in-memory storage that works across requests
const logs: EmailLog[] = [];

export function addLog(log: EmailLog): void {
    logs.unshift(log);
    if (logs.length > 100) {
        logs.pop();
    }

    console.log('='.repeat(80));
    console.log('📧 EMAIL LOG ADDED:');
    console.log(JSON.stringify(log, null, 2));
    console.log(`📊 Total logs: ${logs.length}`);
    console.log('='.repeat(80));
}

export function getLogs(): EmailLog[] {
    console.log(`📊 Returning ${logs.length} logs`);
    return [...logs];
}

export function clearLogs(): void {
    logs.length = 0;
    console.log('🗑️ All logs cleared');
}

export type { EmailLog };