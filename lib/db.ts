interface AppConfig {
    template: string;
    title: string;
    description: string;
    requireEmail: boolean;
    emailLabel: string;
    yesLabel: string;
    noLabel: string;
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
        template: string;
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
    template: process.env.APP_TEMPLATE || "bloom",
    title: process.env.APP_TITLE || "ধুলোয় পূর্ণ, অক্সিজেনশূন্য এই শহরে তুমি কি আমার বেঁচে থাকার বিশুদ্ধ অক্সিজেন হবে? ❤️",
    description: process.env.APP_DESCRIPTION || "এনাটমি বা শারীরবিদ্যা নিয়ে আমার কখনই বিন্দুমাত্র আগ্রহ ছিল না, এখনও নেই। কিন্তু তুমি যে কি নজরকাঁড়া!!! চুম্বকের মত বারবার আমার এই সংযত দৃষ্টিকে আকর্ষণ করে তোমার লাবণ্য। আর আমিও কর্কট রোগগ্রস্ত এক উন্মাদের মত কাপতে কাপতে চলে আসি তোমার তীরে!!",
    requireEmail: process.env.APP_REQUIRE_EMAIL === 'true' || false,
    emailLabel: process.env.APP_EMAIL_LABEL || "Your email address",
    yesLabel: process.env.APP_YES_LABEL || "Yes 💖",
    noLabel: process.env.APP_NO_LABEL || "No",
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

const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE;
let ddbDoc: any = null;
let ddbInitialized = false;

async function initDynamo() {
    if (ddbInitialized) return;
    ddbInitialized = true;

    if (!DYNAMODB_TABLE) return;

    try {
        const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');
        const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-1' });
        ddbDoc = DynamoDBDocumentClient.from(client);
        console.log('✅ DynamoDB connected');
    } catch (err) {
        console.log('⚠️ DynamoDB not available - falling back to Redis/memory', err);
        ddbDoc = null;
    }
}

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
    await initDynamo();

    if (ddbDoc) {
        try {
            const { GetCommand } = await import('@aws-sdk/lib-dynamodb');
            const res = await ddbDoc.send(new GetCommand({ TableName: DYNAMODB_TABLE, Key: { pk: 'CONFIG' } }));
            if (res.Item?.data) {
                return { ...defaultConfig, ...res.Item.data };
            }
            return { ...defaultConfig };
        } catch (err) {
            console.error('DynamoDB get config error:', err);
        }
    }

    await initRedis();

    if (redis) {
        try {
            const configStr = await redis.get('app:config');
            if (configStr) {
                // Handle both string and object responses from Redis
                if (typeof configStr === 'string') {
                    const config = JSON.parse(configStr);
                    return { ...defaultConfig, ...config };
                } else if (typeof configStr === 'object' && configStr !== null) {
                    return { ...defaultConfig, ...(configStr as AppConfig) };
                }
            }
        } catch (err) {
            // Redis error, fall back to default
        }
    }

    if (memoryConfig) return { ...defaultConfig, ...memoryConfig };
    return { ...defaultConfig };
}

export async function setAppConfig(config: AppConfig): Promise<void> {
    await initDynamo();

    if (ddbDoc) {
        try {
            const { PutCommand } = await import('@aws-sdk/lib-dynamodb');
            await ddbDoc.send(new PutCommand({ TableName: DYNAMODB_TABLE, Item: { pk: 'CONFIG', data: config } }));
            return;
        } catch (err) {
            console.error('DynamoDB set config error:', err);
        }
    }

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
    await initDynamo();

    if (ddbDoc) {
        try {
            const { PutCommand } = await import('@aws-sdk/lib-dynamodb');
            const sortKey = `${new Date(log.timestamp).getTime()}#${Math.random().toString(36).slice(2, 8)}`;
            await ddbDoc.send(new PutCommand({
                TableName: DYNAMODB_TABLE,
                Item: { pk: `LOG#${sortKey}`, type: 'LOG', ...log },
            }));
            return;
        } catch (err) {
            console.error('DynamoDB add log error:', err);
        }
    }

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
    await initDynamo();

    if (ddbDoc) {
        try {
            const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
            const res = await ddbDoc.send(new ScanCommand({
                TableName: DYNAMODB_TABLE,
                FilterExpression: '#t = :log',
                ExpressionAttributeNames: { '#t': 'type' },
                ExpressionAttributeValues: { ':log': 'LOG' },
            }));
            const items = (res.Items || []) as (EmailLog & { pk: string; type: string })[];
            return items
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map(({ pk, type, ...log }) => log as EmailLog);
        } catch (err) {
            console.error('DynamoDB get logs error:', err);
        }
    }

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
    await initDynamo();

    if (ddbDoc) {
        try {
            const { ScanCommand, DeleteCommand } = await import('@aws-sdk/lib-dynamodb');
            const res = await ddbDoc.send(new ScanCommand({
                TableName: DYNAMODB_TABLE,
                FilterExpression: '#t = :log',
                ExpressionAttributeNames: { '#t': 'type' },
                ExpressionAttributeValues: { ':log': 'LOG' },
                ProjectionExpression: 'pk',
            }));
            const items = (res.Items || []) as { pk: string }[];
            await Promise.all(items.map(item =>
                ddbDoc.send(new DeleteCommand({ TableName: DYNAMODB_TABLE, Key: { pk: item.pk } }))
            ));
            return;
        } catch (err) {
            console.error('DynamoDB clear logs error:', err);
        }
    }

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
