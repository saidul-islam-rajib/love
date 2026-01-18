import { NextRequest } from 'next/server';

export async function GET() {
    try {
        console.log('🧪 Testing Redis connection...');

        // Check environment variables
        const restUrl = process.env.STORAGE_REST_API_URL || process.env.KV_REST_API_URL;
        const restToken = process.env.STORAGE_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;

        console.log('Environment check:');
        console.log('- STORAGE_REST_API_URL:', process.env.STORAGE_REST_API_URL ? 'SET' : 'NOT SET');
        console.log('- KV_REST_API_URL:', process.env.KV_REST_API_URL ? 'SET' : 'NOT SET');
        console.log('- STORAGE_REST_API_TOKEN:', process.env.STORAGE_REST_API_TOKEN ? 'SET' : 'NOT SET');
        console.log('- KV_REST_API_TOKEN:', process.env.KV_REST_API_TOKEN ? 'SET' : 'NOT SET');

        if (!restUrl || !restToken) {
            return new Response(JSON.stringify({
                error: 'Redis environment variables not found',
                restUrl: !!restUrl,
                restToken: !!restToken,
                env: {
                    STORAGE_REST_API_URL: !!process.env.STORAGE_REST_API_URL,
                    KV_REST_API_URL: !!process.env.KV_REST_API_URL,
                    STORAGE_REST_API_TOKEN: !!process.env.STORAGE_REST_API_TOKEN,
                    KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN
                }
            }, null, 2), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Try to connect to Redis
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
            url: restUrl,
            token: restToken,
        });

        // Test Redis connection
        await redis.set('test:connection', 'working');
        const testValue = await redis.get('test:connection');

        console.log('✅ Redis test successful:', testValue);

        return new Response(JSON.stringify({
            success: true,
            message: 'Redis connection working',
            testValue: testValue,
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
        console.error('❌ Redis test failed:', err);
        return new Response(JSON.stringify({
            error: 'Redis test failed',
            message: err.message,
            stack: err.stack
        }, null, 2), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}