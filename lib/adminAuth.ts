export const ADMIN_COOKIE_NAME = "admin_session";

function getSessionSecret(): string {
    return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "dev-only-insecure-secret";
}

export function checkAdminCredentials(username: string, password: string): boolean {
    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedPass = process.env.ADMIN_PASSWORD;
    if (!expectedUser || !expectedPass) return false;
    return username === expectedUser && password === expectedPass;
}

export function adminSessionCookie(): string {
    const maxAge = 60 * 60 * 8; // 8 hours
    const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return `${ADMIN_COOKIE_NAME}=${getSessionSecret()}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secureFlag}`;
}

export function clearAdminSessionCookie(): string {
    const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return `${ADMIN_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secureFlag}`;
}

export function isAuthorizedAdmin(req: Request): boolean {
    const cookieHeader = req.headers.get("cookie") || "";
    for (const part of cookieHeader.split(";")) {
        const idx = part.indexOf("=");
        if (idx === -1) continue;
        const name = part.slice(0, idx).trim();
        const value = part.slice(idx + 1).trim();
        if (name === ADMIN_COOKIE_NAME) {
            return value === getSessionSecret();
        }
    }
    return false;
}
