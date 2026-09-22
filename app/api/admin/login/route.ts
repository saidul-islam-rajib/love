import { NextRequest } from "next/server";
import { checkAdminCredentials, adminSessionCookie } from "../../../../lib/adminAuth";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!checkAdminCredentials(username, password)) {
            return new Response(JSON.stringify({ error: "Invalid username or password" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": adminSessionCookie()
            }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: "Login failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
