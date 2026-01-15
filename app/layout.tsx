import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "💍 A Special Moment Awaits...",
  description: "Life feels complete with you—will you walk beside me as my spouse? Experience something magical and unforgettable. 💕✨",
  keywords: ["marriage proposal", "love", "engagement", "special moment", "romantic"],
  authors: [{ name: "Rajib" }],
  creator: "Rajib",

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com", // Update this with your actual domain
    siteName: "Marriage Proposal 💍",
    title: "💍 A Special Moment Awaits...",
    description: "Life feels complete with you—will you walk beside me as my spouse? Experience something magical and unforgettable. 💕✨",
    images: [
      {
        url: "/api/og", // Dynamic OG image
        width: 1200,
        height: 630,
        alt: "Marriage Proposal - A Special Moment Awaits",
      },
      {
        url: "/og-preview.svg", // Fallback static image
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
    site: "@your_twitter", // Optional: add your Twitter handle
    creator: "@your_twitter", // Optional: add your Twitter handle
    title: "💍 A Special Moment Awaits...",
    description: "Life feels complete with you... 💕✨",
    images: ["/api/og"],
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

  // Viewport (moved from head tag)
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Marriage Proposal 💍",
              "description": "A special interactive marriage proposal experience",
              "url": process.env.NEXTAUTH_URL || "https://your-domain.com",
              "author": {
                "@type": "Person",
                "name": "Rajib"
              },
              "potentialAction": {
                "@type": "ViewAction",
                "target": process.env.NEXTAUTH_URL || "https://your-domain.com",
                "name": "Experience the Proposal"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
