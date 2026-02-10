/**
 * IP Address Validation Utility
 * Supports IPv4, IPv6, and CIDR notation
 */

/**
 * Check if an IP address is within a CIDR range
 */
export function isIPInCIDR(ip: string, cidr: string): boolean {
    try {
        // Handle IPv4
        if (ip.includes('.') && cidr.includes('.')) {
            return isIPv4InCIDR(ip, cidr);
        }

        // Handle IPv6
        if (ip.includes(':') && cidr.includes(':')) {
            return isIPv6InCIDR(ip, cidr);
        }

        return false;
    } catch (error) {
        console.error('[IP Validator] Error checking IP in CIDR:', error);
        return false;
    }
}

/**
 * Check if IPv4 address is in CIDR range
 */
function isIPv4InCIDR(ip: string, cidr: string): boolean {
    const [range, bits] = cidr.split('/');
    const mask = bits ? parseInt(bits, 10) : 32;

    if (mask < 0 || mask > 32) {
        return false;
    }

    const ipNum = ipv4ToNumber(ip);
    const rangeNum = ipv4ToNumber(range);
    const maskNum = (0xffffffff << (32 - mask)) >>> 0;

    return (ipNum & maskNum) === (rangeNum & maskNum);
}

/**
 * Convert IPv4 address to number
 */
function ipv4ToNumber(ip: string): number {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
        throw new Error(`Invalid IPv4 address: ${ip}`);
    }
    return (parts[0] << 24 | parts[1] << 16 | parts[2] << 8 | parts[3]) >>> 0;
}

/**
 * Check if IPv6 address is in CIDR range (simplified)
 */
function isIPv6InCIDR(ip: string, cidr: string): boolean {
    // Simplified IPv6 check - expand full implementation if needed
    const [range] = cidr.split('/');

    // Normalize addresses
    const normalizedIP = normalizeIPv6(ip);
    const normalizedRange = normalizeIPv6(range);

    // For now, do exact match or prefix match
    return normalizedIP === normalizedRange || normalizedIP.startsWith(normalizedRange);
}

/**
 * Normalize IPv6 address (basic implementation)
 */
function normalizeIPv6(ip: string): string {
    // Remove leading zeros and expand ::
    return ip.toLowerCase().replace(/\b0+/g, '0');
}

/**
 * Check if IP is localhost
 */
export function isLocalhost(ip: string): boolean {
    const localhostAddresses = [
        '127.0.0.1',
        '::1',
        'localhost',
        '::ffff:127.0.0.1'
    ];

    return localhostAddresses.includes(ip.toLowerCase());
}

/**
 * Check if IP is in any of the allowed ranges
 */
export function isIPAllowed(
    ip: string,
    allowedRanges: string[],
    allowLocalhost: boolean = true
): boolean {
    // Check localhost first
    if (allowLocalhost && isLocalhost(ip)) {
        return true;
    }

    // Check each allowed range
    for (const range of allowedRanges) {
        if (range.includes('/')) {
            // CIDR notation
            if (isIPInCIDR(ip, range)) {
                return true;
            }
        } else {
            // Exact match or simple prefix
            if (ip === range || ip.startsWith(range)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Extract real IP from request headers
 */
export function extractIPFromHeaders(headers: {
    get(name: string): string | null;
}): string {
    // Try various headers in order of preference
    let ip = headers.get('x-forwarded-for')
        || headers.get('x-real-ip')
        || headers.get('cf-connecting-ip') // Cloudflare
        || headers.get('x-client-ip')
        || '127.0.0.1';

    // Handle comma-separated list (take first IP - the client)
    if (ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }

    // Remove IPv6 prefix if present (::ffff:192.168.1.1 -> 192.168.1.1)
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }

    return ip;
}

/**
 * Validate IP address format
 */
export function isValidIP(ip: string): boolean {
    // IPv4 regex
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    // IPv6 regex (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

    if (ipv4Regex.test(ip)) {
        const parts = ip.split('.').map(Number);
        return parts.every(part => part >= 0 && part <= 255);
    }

    return ipv6Regex.test(ip);
}
