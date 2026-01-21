export async function GET() {
    try {
        console.log('🔍 Debugging Redis storage...');

        const restUrl = process.env.STORAGE_REST_API_URL || process.env.KV_REST_API_URL;
        const restToken = process.env.STORAGE_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;

        if (!restUrl || !restToken) {
            return new Response(JSON.stringify({
                error: 'Redis not configured'
            }), { status: 500 });
        }

        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
            url: restUrl,
            token: restToken,
        });

        // Check what's actually in Redis
        const allKeys = await redis.keys('*');
        console.log('All Redis keys:', allKeys);

        const emailLogsExists = await redis.exists('email:logs');
        console.log('email:logs exists:', emailLogsExists);

        const logCount = await redis.zcard('email:logs');
        console.log('Log count:', logCount);

        const allLogs = await redis.zrange('email:logs', 0, -1);
        console.log('All logs raw:', allLogs);

        const allLogsWithScores = await redis.zrange('email:logs', 0, -1, { withScores: true });
        console.log('All logs with scores:', allLogsWithScores);

        return new Response(JSON.stringify({
            success: true,
            debug: {
                allKeys,
                emailLogsExists,
                logCount,
                allLogs,
                allLogsWithScores
            }
        }, null, 2), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error('❌ Redis debug failed:', err);
        return new Response(JSON.stringify({
            error: 'Redis debug failed',
            message: err.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}