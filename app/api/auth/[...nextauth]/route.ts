import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Check if Google OAuth is properly configured
const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

const handler = NextAuth({
    providers: isGoogleConfigured ? [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    ] : [],
    callbacks: {
        async session({ session, token }) {
            return session
        },
        async jwt({ token, account, profile }) {
            return token
        }
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
    // Add these for better production handling
    session: {
        strategy: "jwt",
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        }
    }
})

export { handler as GET, handler as POST }