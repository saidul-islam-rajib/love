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

const defaultConfig: AppConfig = {
    title: process.env.APP_TITLE || "তুমি কি আমার বেচে থাকার অক্সিজেন হবে??",
    description: process.env.APP_DESCRIPTION || "তুমি যে কি নজরকাঁড়া!!! চুম্বকের মত বারবার আমার এই সংযত দৃষ্টিকে আকর্ষণ করে তোমার লাবণ্য। আর আমিও কর্কট রোগগ্রস্ত এক উন্মাদের মত কাপতে কাপতে চলে আসি তোমার তীরে!!\n\nI love you more than anything, and I promise to choose you every day, stand by you always, and love you until my last breath. 💍❤️\n\n- SAIDUL ISLAM RAJIB\n\n** NOTE: I STAND ON MY WORDS!",
    requireEmail: process.env.APP_REQUIRE_EMAIL === 'true' || false,
    emailLabel: process.env.APP_EMAIL_LABEL || "Your email address",
    successTitle: process.env.APP_SUCCESS_TITLE || "She said YES! 💍",
    successMessage: process.env.APP_SUCCESS_MESSAGE || "Forever starts now... ✨",
    recipientEmail: process.env.TO_EMAIL || "saidul.is.rajib@gmail.com"
};

let kv: any = null;
let kvInitialized = false;

async function initKV() {
    if (kvInitialized) return;

    try {
        const { kv: vercelKV } = await import('@vercel/kv');
        kv = vercelKV;
        kvInitialized = true;
        console.log('✅ Vercel KV connected');
    } catch (err) {
        console.log('⚠️ Vercel KV not available');
        kvInitialized = true;
    }
}

export async function getAppConfig(): Promise<AppConfig> {
    await initKV();

    if (kv) {
        try {
            const config = await kv.get('app:config');
            if (config) return config;
        } catch (err) {
            console.error('KV get error:', err);
        }
    }

    return { ...defaultConfig };
}

export async function setAppConfig(config: AppConfig): Promise<void> {
    await initKV();

    if (kv) {
        try {
            await kv.set('app:config', config);
            console.log('⚙️ Config saved to KV');
            return;
        } catch (err) {
            console.error('KV set error:', err);
        }
    }

    console.log('⚙️ Config saved (KV not available)');
}

export async function addEmailLog(log: EmailLog): Promise<void> {
    await initKV();

    if (kv) {
        try {
            const timestamp = new Date(log.timestamp).getTime();
            await kv.zadd('email:logs', { score: timestamp, member: JSON.stringify(log) });

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

    console.log('📊 Log saved (KV not available)');
}

export async function getEmailLogs(): Promise<EmailLog[]> {
    await initKV();

    if (kv) {
        try {
            const logs = await kv.zrange('email:logs', 0, -1, { rev: true });
            return logs.map((log: string) => JSON.parse(log));
        } catch (err) {
            console.error('KV get logs error:', err);
        }
    }

    return [];
}

export async function clearEmailLogs(): Promise<void> {
    await initKV();

    if (kv) {
        try {
            await kv.del('email:logs');
            console.log('🗑️ Logs cleared from KV');
            return;
        } catch (err) {
            console.error('KV clear error:', err);
        }
    }

    console.log('🗑️ Logs cleared');
}

export type { AppConfig, EmailLog };
