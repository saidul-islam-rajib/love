interface AppConfig {
    title: string;
    description: string;
    requireEmail: boolean;
    emailLabel: string;
    successTitle: string;
    successMessage: string;
    successSubtext: string;
    recipientEmail: string;
    footerName: string;
    footerFacebookUrl: string;
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
    configSnapshot?: {
        title: string;
        description: string;
        successTitle: string;
        successMessage: string;
        successSubtext: string;
        requireEmail: boolean;
        footerName: string;
        footerFacebookUrl: string;
    };
}

const defaultConfig: AppConfig = {
    title: process.env.APP_TITLE || "তুমি কি আমার বেচে থাকার অক্সিজেন হবে??",
    description: process.env.APP_DESCRIPTION || "তুমি যে কি নজরকাঁড়া!!! চুম্বকের মত বারবার আমার এই সংযত দৃষ্টিকে আকর্ষণ করে তোমার লাবণ্য। আর আমিও কর্কট রোগগ্রস্ত এক উন্মাদের মত কাপতে কাপতে চলে আসি তোমার তীরে!!\n\nI love you more than anything, and I promise to choose you every day, stand by you always, and love you until my last breath. 💍❤️\n\n- SAIDUL ISLAM RAJIB\n\n** NOTE: I STAND ON MY WORDS!",
    requireEmail: process.env.APP_REQUIRE_EMAIL === 'true' || false,
    emailLabel: process.env.APP_EMAIL_LABEL || "Your email address",
    successTitle: process.env.APP_SUCCESS_TITLE || "She said YES! 💍",
    successMessage: process.env.APP_SUCCESS_MESSAGE || "Forever starts now... ✨",
    successSubtext: process.env.APP_SUCCESS_SUBTEXT || "This is the happiest moment of my life!",
    recipientEmail: process.env.TO_EMAIL || "saidul.is.rajib@gmail.com",
    footerName: process.env.APP_FOOTER_NAME || "SAIDUL ISLAM RAJIB",
    footerFacebookUrl: process.env.APP_FOOTER_FACEBOOK || "https://www.facebook.com"
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
                // Handle both string and object responses from Redis
                if (typeof configStr === 'string') {
                    const config = JSON.parse(configStr);
                    return config;
                } else if (typeof configStr === 'object' && configStr !== null) {
                    return configStr as AppConfig;
                }
            }
        } catch (err) {
            // Redis error, fall back to default
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
            return;
        } catch (err) {
            // Redis error, fall back to memory
        }
    }

    memoryConfig = { ...config };
}

export async function addEmailLog(log: EmailLog): Promise<void> {
    await initRedis();

    if (redis) {
        try {
            const timestamp = new Date(log.timestamp).getTime();
            const logString = JSON.stringify(log);
            await redis.zadd('email:logs', { score: timestamp, member: logString });

            const count = await redis.zcard('email:logs');
            if (count > 100) {
                await redis.zpopmin('email:logs', count - 100);
            }
            return;
        } catch (err) {
            // Redis error, fall back to memory
        }
    }

    memoryLogs.unshift(log);
    if (memoryLogs.length > 100) {
        memoryLogs.pop();
    }
}

export async function getEmailLogs(): Promise<EmailLog[]> {
    await initRedis();

    if (redis) {
        try {
            const logs = await redis.zrange('email:logs', 0, -1, { rev: true });
            console.log('Raw logs from Redis:', logs);

            return logs.map((log: any) => {
                try {
                    // If it's already an object, return it directly
                    if (typeof log === 'object' && log !== null) {
                        return log as EmailLog;
                    }
                    // If it's a string, parse it
                    if (typeof log === 'string') {
                        return JSON.parse(log);
                    }
                    console.error('Unexpected log type:', typeof log, log);
                    return null;
                } catch (parseErr) {
                    console.error('Failed to parse log:', log, parseErr);
                    return null;
                }
            }).filter(Boolean) as EmailLog[];
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
            return;
        } catch (err) {
            // Redis error, fall back to memory
        }
    }

    memoryLogs.length = 0;
}

export type { AppConfig, EmailLog };
