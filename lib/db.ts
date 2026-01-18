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

let redis: any = null;
let redisInitialized = false;
const memoryLogs: EmailLog[] = [];
let memoryConfig: AppConfig | null = null;

async function initRedis() {
    if (redisInitialized) return;

    try {
        const restUrl = process.env.STORAGE_REST_API_URL || process.env.KV_REST_API_URL;
        const restToken = process.env.STORAGE_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;

        if (restUrl && restToken) {
            const { Redis } = await import('@upstash/redis');
            redis = new Redis({
                url: restUrl,
                token: restToken,
            });
            redisInitialized = true;
            console.log('✅ Redis connected');
        } else {
            redisInitialized = true;
            console.log('⚠️ Redis not configured - using memory storage');
        }
    } catch (err) {
        console.log('⚠️ Redis not available - using memory storage');
        redisInitialized = true;
    }
}

export async function getAppConfig(): Promise<AppConfig> {
    await initRedis();

    if (redis) {
        try {
            const configStr = await redis.get('app:config');
            if (configStr) {
                const config = JSON.parse(configStr);
                return config;
            }
        } catch (err) {
            console.error('Redis get error:', err);
        }
    }

    if (memoryConfig) return { ...memoryConfig };
    return { ...defaultConfig };
}

export async function setAppConfig(config: AppConfig): Promise<void> {
    await initRedis();

    if (redis) {
        try {
            await redis.set('app:config', JSON.stringify(config));
            console.log('⚙️ Config saved to Redis');
            return;
        } catch (err) {
            console.error('Redis set error:', err);
        }
    }

    memoryConfig = { ...config };
    console.log('⚙️ Config saved to memory');
}

export async function addEmailLog(log: EmailLog): Promise<void> {
    await initRedis();

    if (redis) {
        try {
            const timestamp = new Date(log.timestamp).getTime();
            await redis.zadd('email:logs', { score: timestamp, member: JSON.stringify(log) });

            const count = await redis.zcard('email:logs');
            if (count > 100) {
                await redis.zpopmin('email:logs', count - 100);
            }

            console.log(`📊 Log saved to Redis. Total: ${count}`);
            return;
        } catch (err) {
            console.error('Redis add log error:', err);
        }
    }

    memoryLogs.unshift(log);
    if (memoryLogs.length > 100) {
        memoryLogs.pop();
    }
    console.log(`📊 Log saved to memory. Total: ${memoryLogs.length}`);
    console.log('='.repeat(80));
    console.log('📧 EMAIL LOG ENTRY:');
    console.log(JSON.stringify(log, null, 2));
    console.log('='.repeat(80));
}

export async function getEmailLogs(): Promise<EmailLog[]> {
    await initRedis();

    if (redis) {
        try {
            const logs = await redis.zrange('email:logs', 0, -1, { rev: true });
            return logs.map((log: string) => {
                try {
                    return JSON.parse(log);
                } catch (parseErr) {
                    console.error('Failed to parse log:', log, parseErr);
                    return null;
                }
            }).filter(Boolean);
        } catch (err) {
            console.error('Redis get logs error:', err);
        }
    }

    console.log(`📊 Returning ${memoryLogs.length} logs from memory`);
    return [...memoryLogs];
}

export async function clearEmailLogs(): Promise<void> {
    await initRedis();

    if (redis) {
        try {
            await redis.del('email:logs');
            console.log('🗑️ Logs cleared from Redis');
            return;
        } catch (err) {
            console.error('Redis clear error:', err);
        }
    }

    memoryLogs.length = 0;
    console.log('🗑️ Logs cleared from memory');
}

export type { AppConfig, EmailLog };
