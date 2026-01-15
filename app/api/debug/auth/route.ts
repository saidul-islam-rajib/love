export async function GET() {
    const debug = {
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV,
        // Don't expose actual secrets, just check if they exist
        googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
        googleClientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
        nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0
    };

    return new Response(JSON.stringify(debug, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}