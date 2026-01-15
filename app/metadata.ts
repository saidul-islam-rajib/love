import { Metadata } from 'next'
import fs from 'fs/promises'
import path from 'path'

interface AppConfig {
    title: string;
    description: string;
    successTitle: string;
    successMessage: string;
    recipientEmail: string;
}

const defaultConfig: AppConfig = {
    title: "Life feels complete with you",
    description: "From the moment we met, you've been my greatest blessing. You understand me in ways no one else does, you make ordinary days extraordinary, and you've shown me a love I never knew existed.",
    successTitle: "She said YES! 💍",
    successMessage: "Forever starts now... ✨",
    recipientEmail: "saidul.is.rajib@gmail.com"
}

async function getConfig(): Promise<AppConfig> {
    try {
        const configPath = path.join(process.cwd(), 'app-config.json')
        const data = await fs.readFile(configPath, 'utf-8')
        return JSON.parse(data)
    } catch {
        return defaultConfig
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const config = await getConfig()

    // Truncate description for meta tags
    const metaDescription = config.description.length > 160
        ? config.description.substring(0, 157) + '...'
        : config.description

    const ogImageUrl = `/api/og?title=${encodeURIComponent(config.title)}&subtitle=${encodeURIComponent('Experience something magical and unforgettable. 💕✨')}`

    return {
        title: `💍 ${config.title}`,
        description: `${metaDescription} Experience something magical and unforgettable. 💕✨`,
        keywords: ["marriage proposal", "love", "engagement", "special moment", "romantic", "proposal"],
        authors: [{ name: "Rajib" }],
        creator: "Rajib",

        // Open Graph (Facebook, LinkedIn, etc.)
        openGraph: {
            type: "website",
            locale: "en_US",
            url: process.env.NEXTAUTH_URL || "https://your-domain.com",
            siteName: "Marriage Proposal 💍",
            title: `💍 ${config.title}`,
            description: `${metaDescription} Experience something magical and unforgettable. 💕✨`,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: "Marriage Proposal - A Special Moment Awaits",
                },
                {
                    url: "/og-preview.svg",
                    width: 1200,
                    height: 630,
                    alt: "Marriage Proposal - A Special Moment Awaits",
                    type: "image/svg+xml",
                }
            ],
        },

        // Twitter Card
        twitter: {
            card: "summary_large_image",
            title: `💍 ${config.title}`,
            description: `${metaDescription} Experience something magical and unforgettable. 💕✨`,
            images: [ogImageUrl],
        },

        // Additional meta tags
        robots: {
            index: true,
            follow: true,
        },

        // Favicon and app icons
        icons: {
            icon: [
                { url: "/favicon.ico", sizes: "any" },
                { url: "/icon.svg", type: "image/svg+xml" },
            ],
            apple: [
                { url: "/apple-touch-icon.png", sizes: "180x180" },
            ],
        },

        // Theme color for mobile browsers
        themeColor: "#667eea",

        // Viewport
        viewport: "width=device-width, initial-scale=1",
    }
}