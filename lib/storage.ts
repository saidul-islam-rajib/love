// Global singleton storage for serverless environment
// This ensures all API routes share the same data within a deployment

interface AppConfig {
    title: string;
    description: string;
    requireEmail: boolean;
    emailLabel: string;
    successTitle: string;
    successMessage: string;
    recipientEmail: string;
}

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

// Use global to persist across module reloads in development
const globalForStorage = global as unknown as {
    appConfig: AppConfig | undefined;
    emailLogs: EmailLog[] | undefined;
};

// Default configuration
const defaultConfig: AppConfig = {
    title: process.env.APP_TITLE || "তুমি কি আমার বেচে থাকার অক্সিজেন হবে??",
    description: process.env.APP_DESCRIPTION || "তুমি যে কি নজরকাঁড়া!!! চুম্বকের মত বারবার আমার এই সংযত দৃষ্টিকে আকর্ষণ করে তোমার লাবণ্য। আর আমিও কর্কট রোগগ্রস্ত এক উন্মাদের মত কাপতে কাপতে চলে আসি তোমার তীরে!!\n\nI love you more than anything, and I promise to choose you every day, stand by you always, and love you until my last breath. 💍❤️\n\n- SAIDUL ISLAM RAJIB\n\n** Note: I stand on my words!",
    requireEmail: process.env.APP_REQUIRE_EMAIL === 'true' || false,
    emailLabel: process.env.APP_EMAIL_LABEL || "Your email address",
    successTitle: process.env.APP_SUCCESS_TITLE || "She said YES! 💍",
    successMessage: process.env.APP_SUCCESS_MESSAGE || "Forever starts now... ✨",
    recipientEmail: process.env.TO_EMAIL || "saidul.is.rajib@gmail.com"
};

// Initialize storage
if (!globalForStorage.appConfig) {
    globalForStorage.appConfig = { ...defaultConfig };
}

if (!globalForStorage.emailLogs) {
    globalForStorage.emailLogs = [];
}

// App Configuration Functions
export function getAppConfig(): AppConfig {
    return { ...globalForStorage.appConfig! };
}

export function setAppConfig(config: AppConfig): void {
    globalForStorage.appConfig = { ...config };
    console.log('='.repeat(80));
    console.log('⚙️ APP CONFIGURATION UPDATED');
    console.log('='.repeat(80));
    console.log(JSON.stringify(config, null, 2));
    console.log('='.repeat(80));
}

// Email Logs Functions
export function addEmailLog(log: EmailLog): void {
    if (!globalForStorage.emailLogs) {
        globalForStorage.emailLogs = [];
    }
    globalForStorage.emailLogs.unshift(log);

    // Keep only last 100 entries
    if (globalForStorage.emailLogs.length > 100) {
        globalForStorage.emailLogs = globalForStorage.emailLogs.slice(0, 100);
    }

    console.log(`📊 Total logs in storage: ${globalForStorage.emailLogs.length}`);
}

export function getEmailLogs(): EmailLog[] {
    if (!globalForStorage.emailLogs) {
        globalForStorage.emailLogs = [];
    }
    return [...globalForStorage.emailLogs];
}

export function clearEmailLogs(): void {
    globalForStorage.emailLogs = [];
}

// Export types
export type { AppConfig, EmailLog };
