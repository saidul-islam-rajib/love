export async function GET() {
    try {
        console.log('🧪 Simple Redis test...');

        const restUrl = process.env.STORAGE_REST_API_URL || process.env.KV_REST_API_URL;
        const restToken = process.env.STORAGE_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;

        if (!restUrl || !restToken) {
            return new Response('Redis not configured', { status: 500 });
        }

        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
            url: restUrl,
            token: restToken,
        });

        // Simple test: store and retrieve
        const testData = { message: 'Hello Redis', timestamp: new Date().toISOString() };
        const testString = JSON.stringify(testData);

        // Store in sorted set
        await redis.zadd('test:simple', { score: Date.now(), member: testString });

        // Retrieve from sorted set
        const retrieved = await redis.zrange('test:simple', 0, -1);

        console.log('Stored:', testString);
        console.log('Retrieved:', retrieved);

        return new Response(JSON.stringify({
            success: true,
            stored: testString,
            retrieved: retrieved,
            parsed: retrieved.map(item => JSON.parse(item))
        }, null, 2), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error('Simple test failed:', err);
        return new Response(JSON.stringify({
            error: err.message,
            stack: err.stack
        }), { status: 500 });
    }
}