import { NextRequest } from 'next/server';

interface AppConfig {
    title: string;
    description: string;
    requireEmail: boolean;
    emailLabel: string;
    successTitle: string;
    successMessage: string;
    recipientEmail: string;
}

const defaultConfig: AppConfig = {
    title: process.env.APP_TITLE || "Life feels complete with you...✨",
    description: process.env.APP_DESCRIPTION || "I cannot explain how much you mean to me.",
    requireEmail: process.env.APP_REQUIRE_EMAIL === 'true' || false,
    emailLabel: process.env.APP_EMAIL_LABEL || "Your email address",
    successTitle: process.env.APP_SUCCESS_TITLE || "She said YES! 💍",
    successMessage: process.env.APP_SUCCESS_MESSAGE || "Forever starts now... ✨",
    recipientEmail: process.env.TO_EMAIL || "saidul.is.rajib@gmail.com"
};

let runtimeConfig: AppConfig = { ...defaultConfig };

async function getConfig(): Promise<AppConfig> {
    return runtimeConfig;
}

async function saveConfig(config: AppConfig): Promise<void> {
    runtimeConfig = { ...config };
}

export async function GET() {
    try {
        const config = await getConfig();
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
        await saveConfig(body);
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
