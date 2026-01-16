// Vercel KV storage for persistent logs across serverless instances
// Falls back to in-memory storage if KV is not configured

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

// Check if Vercel KV is available
const hasKV = typeof process.env.KV_REST_API_URL !== 'undefined' &&
    typeof process.env.KV_REST_API_TOKEN !== 'undefined';

let kv: any = null;

// Initialize KV if available
if (hasKV) {
    try {
        // Dynamic import to avoid errors if @vercel/kv is not installed
        kv = require('@vercel/kv').kv;
        console.log('✅ Vercel KV initialized');
    } catch (err) {
        console.log('⚠️ Vercel KV not available, using in-memory storage');
    }
}

// Fallback to in-memory storage
const globalForStorage = global as unknown as {
    appConfig: AppConfig | undefined;
    emailLogs: EmailLog[] | undefined;
};

const defaultConfig: AppConfig = {
    title: process.env.APP_TITLE || "তুমি কি আমার বেচে থাকার অক্সিজেন হবে??",
    description: process.env.APP_DESCRIPTION || "তুমি যে কি নজরকাঁড়া!!! চুম্বকের মত বারবার আমার এই সংযত দৃষ্টিকে আকর্ষণ করে তোমার লাবণ্য। আর আমিও কর্কট রোগগ্রস্ত এক উন্মাদের মত কাপতে কাপতে চলে আসি তোমার তীরে!!\n\nI love you more than anything, and I promise to choose you every day, stand by you always, and love you until my last breath. 💍❤️\n\n- SAIDUL ISLAM RAJIB\n\n** NOTE: I STAND ON MY WORDS!",
    requireEmail: process.env.APP_REQUIRE_EMAIL === 'true' || false,
    emailLabel: process.env.APP_EMAIL_LABEL || "Your email address",
    successTitle: process.env.APP_SUCCESS_TITLE || "She said YES! 💍",
    successMessage: process.env.APP_SUCCESS_MESSAGE || "Forever starts now... ✨",
    recipientEmail: process.env.TO_EMAIL || "saidul.is.rajib@gmail.com"
};

if (!globalForStorage.appConfig) {
    globalForStorage.appConfig = { ...defaultConfig };
}

if (!globalForStorage.emailLogs) {
    globalForStorage.emailLogs = [];
}

// App Configuration Functions
export async function getAppConfig(): Promise<AppConfig> {
    if (kv) {
        try {
            const config = await kv.get('app:config');
            return config || { ...defaultConfig };
        } catch (err) {
            console.error('KV get config error:', err);
        }
    }
    return { ...globalForStorage.appConfig! };
}

export async function setAppConfig(config: AppConfig): Promise<void> {
    if (kv) {
        try {
            await kv.set('app:config', config);
            console.log('⚙️ Config saved to KV');
            return;
        } catch (err) {
            console.error('KV set config error:', err);
        }
    }
    globalForStorage.appConfig = { ...config };
    console.log('⚙️ Config saved to memory (KV not available)');
}

// Email Logs Functions
export async function addEmailLog(log: EmailLog): Promise<void> {
    if (kv) {
        try {
            // Add to list with timestamp as score
            const timestamp = new Date(log.timestamp).getTime();
            await kv.zadd('email:logs', { score: timestamp, member: JSON.stringify(log) });

            // Keep only last 100 entries
            const count = await kv.zcard('email:logs');
            if (count > 100) {
                await kv.zpopmin('email:logs', count - 100);
            }

            console.log(`📊 Log saved to KV. Total: ${count}`);
            return;
        } catch (err) {
            console.error('KV add log error:', err);
        }
    }

    // Fallback to memory
    if (!globalForStorage.emailLogs) {
        globalForStorage.emailLogs = [];
    }
    globalForStorage.emailLogs.unshift(log);
    if (globalForStorage.emailLogs.length > 100) {
        globalForStorage.emailLogs = globalForStorage.emailLogs.slice(0, 100);
    }
    console.log(`📊 Log saved to memory. Total: ${globalForStorage.emailLogs.length}`);
}

export async function getEmailLogs(): Promise<EmailLog[]> {
    if (kv) {
        try {
            // Get logs in reverse order (newest first)
            const logs = await kv.zrange('email:logs', 0, -1, { rev: true });
            return logs.map((log: string) => JSON.parse(log));
        } catch (err) {
            console.error('KV get logs error:', err);
        }
    }

    // Fallback to memory
    if (!globalForStorage.emailLogs) {
        globalForStorage.emailLogs = [];
    }
    return [...globalForStorage.emailLogs];
}

export async function clearEmailLogs(): Promise<void> {
    if (kv) {
        try {
            await kv.del('email:logs');
            console.log('🗑️ Logs cleared from KV');
            return;
        } catch (err) {
            console.error('KV clear logs error:', err);
        }
    }
    globalForStorage.emailLogs = [];
    console.log('🗑️ Logs cleared from memory');
}

export { AppConfig, EmailLog };
