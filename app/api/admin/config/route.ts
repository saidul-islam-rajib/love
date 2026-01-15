import fs from 'fs/promises';
import path from 'path';

const CONFIG_FILE = 'app-config.json';

interface AppConfig {
    title: string;
    description: string;
    successTitle: string;
    successMessage: string;
    recipientEmail: string;
}

const defaultConfig: AppConfig = {
    title: "Life feels complete with you—will you walk beside me as my spouse?",
    description: "From the moment we met, you've been my greatest blessing. You understand me in ways no one else does, you make ordinary days extraordinary, and you've shown me a love I never knew existed. I want to wake up next to you every morning, face life's adventures together, and grow old holding your hand. You're not just my love—you're my best friend, my safe place, my home. I can't imagine a future without you in it, and I don't want to. So here I am, with all my heart, asking you to be mine forever.",
    successTitle: "She said YES! 💍",
    successMessage: "Forever starts now... ✨",
    recipientEmail: "saidul.is.rajib@gmail.com"
};

async function getConfig(): Promise<AppConfig> {
    try {
        const configPath = path.join(process.cwd(), CONFIG_FILE);
        const data = await fs.readFile(configPath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return defaultConfig;
    }
}

async function saveConfig(config: AppConfig): Promise<void> {
    const configPath = path.join(process.cwd(), CONFIG_FILE);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
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

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await saveConfig(body);
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error('Error saving config:', err);
        return new Response(JSON.stringify({ error: 'Failed to save config' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
