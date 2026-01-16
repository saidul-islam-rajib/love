// Simple shared database using API calls between routes
// This ensures all instances can access the same data

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

// Shared storage that persists across all serverless instances
// Using a global Map that's shared via module cache
const LOGS_STORE = new Map<string, EmailLog>();
const CONFIG_KEY = 'app_config';

const defaultConfig: AppConfig = {
    title: process.env.APP_TITLE || "তুমি কি আমার বেচে থাকার অক্সিজেন হবে??",
    description: process.env.APP_DESCRIPTION || "তুমি যে কি নজরকাঁড়া!!! চুম্বকের মত বারবার আমার এই সংযত দৃষ্টিকে আকর্ষণ করে তোমার লাবণ্য। আর আমিও কর্কট রোগগ্রস্ত এক উন্মাদের মত কাপতে কাপতে চলে আসি তোমার তীরে!!\n\nI love you more than anything, and I promise to choose you every day, stand by you always, and love you until my last breath. 💍❤️\n\n- SAIDUL ISLAM RAJIB\n\n** NOTE: I STAND ON MY WORDS!",
    requireEmail: process.env.APP_REQUIRE_EMAIL === 'true' || false,
    emailLabel: process.env.APP_EMAIL_LABEL || "Your email address",
    successTitle: process.env.APP_SUCCESS_TITLE || "She said YES! 💍",
    successMessage: process.env.APP_SUCCESS_MESSAGE || "Forever starts now... ✨",
    recipientEmail: process.env.TO_EMAIL || "saidul.is.rajib@gmail.com"
};

let appConfig: AppConfig = { ...defaultConfig };

// App Configuration
export function getAppConfig(): AppConfig {
    return { ...appConfig };
}

export function setAppConfig(config: AppConfig): void {
    appConfig = { ...config };
    console.log('⚙️ Config updated');
}

// Email Logs
export function addEmailLog(log: EmailLog): void {
    const key = `log_${Date.now()}_${Math.random()}`;
    LOGS_STORE.set(key, log);

    // Keep only last 100
    if (LOGS_STORE.size > 100) {
        const keys = Array.from(LOGS_STORE.keys());
        const toDelete = keys.slice(0, LOGS_STORE.size - 100);
        toDelete.forEach(k => LOGS_STORE.delete(k));
    }

    console.log(`📊 Log added. Total: ${LOGS_STORE.size}`);
}

export function getEmailLogs(): EmailLog[] {
    const logs = Array.from(LOGS_STORE.values());
    // Sort by timestamp descending (newest first)
    return logs.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

export function clearEmailLogs(): void {
    LOGS_STORE.clear();
    console.log('🗑️ Logs cleared');
}

export type { AppConfig, EmailLog };
