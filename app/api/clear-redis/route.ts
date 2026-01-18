export async function GET() {
    try {
        console.log('🧹 Clearing Redis data...');

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

        // Clear all email logs and config
        await redis.del('email:logs');
        await redis.del('app:config');

        console.log('✅ Redis cleared successfully');

        return new Response(JSON.stringify({
            success: true,
            message: 'Redis cleared successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error('❌ Redis clear failed:', err);
        return new Response(JSON.stringify({
            error: 'Redis clear failed',
            message: err.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}