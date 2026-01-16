import { NextRequest } from 'next/server';
import { getAppConfig, setAppConfig } from '../../../../lib/simple-db';

export async function GET() {
    try {
        const config = getAppConfig();
        console.log('📖 Config GET request');
        return new Response(JSON.stringify(config), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error('Error reading config:', err);
        return new Response(JSON.stringify({ error: 'Failed to read config' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        setAppConfig(body);
        console.log('💾 Config saved successfully');
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error('Error saving config:', err);
        return new Response(JSON.stringify({ error: 'Failed to save config', details: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
