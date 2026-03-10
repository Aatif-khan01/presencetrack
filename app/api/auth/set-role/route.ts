import { NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/security";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Server-side API route to set the role cookie as HttpOnly.
 * This prevents JavaScript from reading/modifying the role cookie,
 * making it resistant to XSS attacks and cookie spoofing.
 */
export async function POST(request: Request) {
    try {
        // Rate limit: 10 requests per minute per IP
        const ip = getClientIP(request);
        const rl = checkRateLimit(`set-role:${ip}`, 10, 60000);
        if (!rl.allowed) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
            );
        }

        const body = await request.json();
        const { role, token } = body;

        // Validate role
        if (!role || !['student', 'teacher'].includes(role)) {
            return NextResponse.json(
                { error: "Invalid role" },
                { status: 400 }
            );
        }

        // Validate token exists (basic check — Firebase verifies on the client side)
        if (!token || typeof token !== 'string' || token.length < 10) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Set HttpOnly, Secure, SameSite cookie
        const isProduction = process.env.NODE_ENV === 'production';
        const response = NextResponse.json({ success: true });
        
        response.cookies.set('presence_role', role, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            path: '/',
            maxAge: 86400, // 24 hours
        });

        return response;
    } catch {
        return NextResponse.json(
            { error: "Failed to set role" },
            { status: 500 }
        );
    }
}

/**
 * DELETE handler to clear the role cookie on logout.
 */
export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.set('presence_role', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0, // Expire immediately
    });
    return response;
}
