export async function GET() {
    try {
        const restUrl = process.env.STORAGE_REST_API_URL || process.env.KV_REST_API_URL;
        const restToken = process.env.STORAGE_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;

        if (!restUrl || !restToken) {
            return new Response(JSON.stringify({
                error: 'Redis not configured',
                env: {
                    STORAGE_REST_API_URL: !!process.env.STORAGE_REST_API_URL,
                    KV_REST_API_URL: !!process.env.KV_REST_API_URL,
                    STORAGE_REST_API_TOKEN: !!process.env.STORAGE_REST_API_TOKEN,
                    KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN
                }
            }), { status: 500 });
        }

        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
            url: restUrl,
            token: restToken,
        });

        // Check what's stored in Redis for config
        const configRaw = await redis.get('app:config');

        // Also check all keys
        const allKeys = await redis.keys('*');

        return new Response(JSON.stringify({
            success: true,
            configRaw: configRaw,
            configType: typeof configRaw,
            allKeys: allKeys,
            env: {
                STORAGE_REST_API_URL: !!process.env.STORAGE_REST_API_URL,
                KV_REST_API_URL: !!process.env.KV_REST_API_URL,
                STORAGE_REST_API_TOKEN: !!process.env.STORAGE_REST_API_TOKEN,
                KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN
            }
        }, null, 2), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        return new Response(JSON.stringify({
            error: 'Debug failed',
            message: err.message,
            stack: err.stack
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}