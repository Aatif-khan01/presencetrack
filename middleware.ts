import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractIPFromHeaders, isIPAllowed, isValidIP } from '@/lib/ip-validator';

// Load configuration from environment variables
const ALLOWED_IP_RANGES = process.env.ALLOWED_IP_RANGES?.split(',').map(r => r.trim()) || ['49.36.201.5/32'];
const ALLOWED_LOCALHOST = process.env.ALLOWED_LOCALHOST !== 'false';
const BYPASS_WIFI_CHECK = process.env.BYPASS_WIFI_CHECK === 'true';

/**
 * Detect if the request is coming from iOS Safari
 */
function isIOSSafari(userAgent: string | null): boolean {
    if (!userAgent) return false;
    const ua = userAgent.toLowerCase();
    const isIOS = ua.includes('iphone') || ua.includes('ipad');
    const isSafari = ua.includes('safari') && !ua.includes('crios') && !ua.includes('fxios') && !ua.includes('edgios');
    return isIOS && isSafari;
}

/**
 * Middleware for Wi-Fi based room access control
 * Enforces IP-based restrictions for students accessing rooms
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only enforce for /room/* and /api/attendance/* routes
    if (pathname.startsWith('/room/') || pathname.startsWith('/api/attendance/')) {

        // Development bypass
        if (BYPASS_WIFI_CHECK) {
            return NextResponse.next();
        }

        // 1. Check User Role (Exempt Teachers) — uses HttpOnly cookie set by server
        const roleCookie = request.cookies.get('presence_role');
        const role = roleCookie?.value;

        if (role?.toLowerCase() === 'teacher') {
            return NextResponse.next();
        }

        // 2. Extract and validate IP address
        const ip = extractIPFromHeaders(request.headers);

        if (!isValidIP(ip)) {
            return createAccessDeniedResponse(request, 'Invalid network detected');
        }

        // 3. Check if IP is in allowed ranges
        const isAllowed = isIPAllowed(ip, ALLOWED_IP_RANGES, ALLOWED_LOCALHOST);

        if (!isAllowed) {
            const userAgent = request.headers.get('user-agent');
            const privateRelay = isIOSSafari(userAgent);
            return createAccessDeniedResponse(request, undefined, privateRelay);
        }
    }

    return NextResponse.next();
}

/**
 * Create appropriate access denied response
 * SECURITY: Does NOT leak IP addresses, allowed ranges, or internal details
 */
function createAccessDeniedResponse(request: NextRequest, reason?: string, privateRelay?: boolean): NextResponse {
    const { pathname } = request.nextUrl;

    // For API routes, return 403 JSON
    if (pathname.startsWith('/api/')) {
        return NextResponse.json(
            {
                error: 'Access Denied',
                message: privateRelay
                    ? 'iCloud Private Relay detected. Please disable Private Relay for this website in Safari settings to mark attendance.'
                    : 'Please connect to the university Wi-Fi to access this resource.',
                privateRelay: privateRelay || false,
            },
            { status: 403 }
        );
    }

    // For Pages, redirect to /access-denied
    const url = request.nextUrl.clone();
    const originalPath = pathname + request.nextUrl.search;
    url.pathname = '/access-denied';
    url.searchParams.set('returnTo', originalPath);
    if (reason) {
        url.searchParams.set('reason', reason);
    }
    if (privateRelay) {
        url.searchParams.set('privateRelay', 'true');
    }

    return NextResponse.redirect(url);
}

export const config = {
    matcher: ['/room/:path*', '/api/attendance/:path*', '/api/network-status'],
};
