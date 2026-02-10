import { NextResponse } from 'next/server';
import { extractIPFromHeaders, isIPAllowed, isValidIP } from '@/lib/ip-validator';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Load configuration (same as middleware)
const ALLOWED_IP_RANGES = process.env.ALLOWED_IP_RANGES?.split(',').map(r => r.trim()) || ['192.168.29.0/24'];
const ALLOWED_LOCALHOST = process.env.ALLOWED_LOCALHOST !== 'false';

/**
 * Network Status API
 * Returns the current IP address and whether it's allowed
 */
export async function GET(request: Request) {
    try {
        // Extract IP from headers
        const headers = {
            get: (name: string) => request.headers.get(name)
        };

        const ip = extractIPFromHeaders(headers);
        const isValid = isValidIP(ip);
        const isAllowed = isValid && isIPAllowed(ip, ALLOWED_IP_RANGES, ALLOWED_LOCALHOST);

        return NextResponse.json({
            success: true,
            detectedIP: ip,
            isValid,
            allowed: isAllowed,
            allowedRanges: ALLOWED_IP_RANGES,
            timestamp: new Date().toISOString(),
            diagnostics: {
                isLocalhost: ip === '127.0.0.1' || ip === '::1',
                ipVersion: ip.includes(':') ? 'IPv6' : 'IPv4',
                headers: {
                    'x-forwarded-for': request.headers.get('x-forwarded-for'),
                    'x-real-ip': request.headers.get('x-real-ip'),
                    'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
                }
            }
        });
    } catch (error) {
        console.error('[Network Status API] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to determine network status',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
