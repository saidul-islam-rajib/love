import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
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
        url: "/og-preview.svg", // Static SVG image
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
    images: ["/og-preview.svg"],
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
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
