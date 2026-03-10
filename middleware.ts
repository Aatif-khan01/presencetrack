import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractIPFromHeaders, isIPAllowed, isValidIP } from '@/lib/ip-validator';

// Load configuration from environment variables
const ALLOWED_IP_RANGES = process.env.ALLOWED_IP_RANGES?.split(',').map(r => r.trim()) || ['49.36.201.5/32'];
const ALLOWED_LOCALHOST = process.env.ALLOWED_LOCALHOST !== 'false';
const BYPASS_WIFI_CHECK = process.env.BYPASS_WIFI_CHECK === 'true';

/**
 * Detect if the request is coming from iOS Safari
 * This helps identify users who may have iCloud Private Relay enabled,
 * which masks their real IP and breaks Wi-Fi-based verification.
 */
function isIOSSafari(userAgent: string | null): boolean {
    if (!userAgent) return false;
    const ua = userAgent.toLowerCase();
    // iOS Safari: contains 'iphone' or 'ipad', contains 'safari', and does NOT contain 'crios' (Chrome) or 'fxios' (Firefox)
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

        // Development bypass (use with caution!)
        if (BYPASS_WIFI_CHECK) {
            console.warn('[Middleware] ⚠️  Wi-Fi check bypassed via environment variable');
            return NextResponse.next();
        }

        // 1. Check User Role (Exempt Teachers)
        const roleCookie = request.cookies.get('presence_role');
        const role = roleCookie?.value;

        if (role?.toLowerCase() === 'teacher') {
            console.log('[Middleware] ✅ Teacher access granted (role-based exemption)');
            return NextResponse.next();
        } else {
            console.log(`[Middleware] ℹ️ Role check failed. Cookie: ${role || 'missing'}, check: ${role === 'teacher'}`);
        }

        // 2. Extract and validate IP address
        const ip = extractIPFromHeaders(request.headers);

        // Validate IP format
        if (!isValidIP(ip)) {
            console.error(`[Middleware] ❌ Invalid IP format: ${ip}`);
            return createAccessDeniedResponse(request, ip, 'Invalid IP format');
        }

        // 3. Check if IP is in allowed ranges
        const isAllowed = isIPAllowed(ip, ALLOWED_IP_RANGES, ALLOWED_LOCALHOST);

        if (!isAllowed) {
            const timestamp = new Date().toISOString();
            const userAgent = request.headers.get('user-agent');
            const privateRelay = isIOSSafari(userAgent);
            console.log(`[Middleware] 🚫 Access Denied | Time: ${timestamp} | IP: ${ip} | Path: ${pathname} | Role: ${role || 'none'} | iOS Safari: ${privateRelay}`);
            return createAccessDeniedResponse(request, ip, undefined, privateRelay);
        }

        // Access granted
        console.log(`[Middleware] ✅ Access Granted | IP: ${ip} | Path: ${pathname}`);
    }

    return NextResponse.next();
}

/**
 * Create appropriate access denied response
 * NOTE: We use the full request URL to avoid runtime errors in middleware.
 */
function createAccessDeniedResponse(request: NextRequest, ip: string, reason?: string, privateRelay?: boolean): NextResponse {
    const { pathname } = request.nextUrl;
    // For API routes, return 403 JSON
    if (pathname.startsWith('/api/')) {
        return NextResponse.json(
            {
                error: 'Access Denied: Invalid Network',
                message: privateRelay
                    ? 'iCloud Private Relay detected. Please disable Private Relay for this website in Safari settings to mark attendance.'
                    : 'Please connect to the university Wi-Fi to access this resource.',
                detectedIP: ip,
                reason: reason || 'IP not in allowed range',
                privateRelay: privateRelay || false,
                allowedRanges: ALLOWED_IP_RANGES
            },
            { status: 403 }
        );
    }

    // For Pages, redirect to /access-denied with IP info
    const url = request.nextUrl.clone();
    url.pathname = '/access-denied';
    url.searchParams.set('ip', ip);
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
