import { clearAdminSessionCookie } from "../../../../lib/adminAuth";

export async function POST() {
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Set-Cookie": clearAdminSessionCookie()
        }
    });
}
