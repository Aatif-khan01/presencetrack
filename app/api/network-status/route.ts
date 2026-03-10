import { NextResponse } from 'next/server';
import { extractIPFromHeaders, isIPAllowed, isValidIP } from '@/lib/ip-validator';
import { checkRateLimit, getClientIP } from '@/lib/security';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Load configuration (same as middleware)
const ALLOWED_IP_RANGES = process.env.ALLOWED_IP_RANGES?.split(',').map(r => r.trim()) || ['192.168.29.0/24'];
const ALLOWED_LOCALHOST = process.env.ALLOWED_LOCALHOST !== 'false';

/**
 * Network Status API
 * Returns whether the user is on campus Wi-Fi.
 * SECURITY: Does NOT expose allowed ranges, internal headers, or diagnostics.
 */
export async function GET(request: Request) {
    try {
        // Rate limit: 60 requests per minute per IP
        const clientIP = getClientIP(request);
        const rl = checkRateLimit(`network:${clientIP}`, 60, 60000);
        if (!rl.allowed) {
            return NextResponse.json(
                { success: false, error: 'Too many requests' },
                { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
            );
        }

        // Extract IP from headers
        const headers = {
            get: (name: string) => request.headers.get(name)
        };

        const ip = extractIPFromHeaders(headers);
        const isValid = isValidIP(ip);
        const isLocal = ip === '127.0.0.1' || ip === '::1';
        const isAllowed = isValid && isIPAllowed(ip, ALLOWED_IP_RANGES, ALLOWED_LOCALHOST);
        // onCampus = truly on campus Wi-Fi (allowed AND not just localhost)
        const onCampus = isAllowed && !isLocal;

        return NextResponse.json({
            success: true,
            detectedIP: ip,
            allowed: isAllowed,
            onCampus,
            timestamp: new Date().toISOString(),
        });
    } catch {
        return NextResponse.json(
            { success: false, error: 'Failed to determine network status' },
            { status: 500 }
        );
    }
}
