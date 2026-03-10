/**
 * Security Utilities for Presence Track
 * - Input sanitization
 * - Rate limiting
 */

// ============ INPUT SANITIZATION ============

/**
 * Strip HTML tags and trim whitespace from user input.
 * Prevents stored XSS when user data is rendered in the app.
 */
export function sanitizeInput(input: string, maxLength: number = 200): string {
    if (typeof input !== 'string') return '';
    return input
        .replace(/[<>]/g, '') // Remove angle brackets (prevents HTML injection)
        .replace(/&/g, '&amp;') // Encode ampersands
        .replace(/"/g, '&quot;') // Encode double quotes
        .replace(/'/g, '&#x27;') // Encode single quotes
        .trim()
        .slice(0, maxLength);
}

/**
 * Sanitize and validate email format
 */
export function sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return '';
    const cleaned = email.trim().toLowerCase().slice(0, 254); // RFC 5321 max
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleaned)) {
        throw new Error('Invalid email format');
    }
    return cleaned;
}

/**
 * Validate enrollment number format (alphanumeric, dashes, slashes only)
 */
export function sanitizeEnrollmentNumber(enrollment: string): string {
    if (typeof enrollment !== 'string') return '';
    const cleaned = enrollment.trim().slice(0, 30);
    if (!/^[a-zA-Z0-9\-\/]+$/.test(cleaned)) {
        throw new Error('Invalid enrollment number format');
    }
    return cleaned;
}

/**
 * Validate and sanitize a room code (alphanumeric only, uppercase)
 */
export function sanitizeRoomCode(code: string): string {
    if (typeof code !== 'string') return '';
    const cleaned = code.trim().toUpperCase().slice(0, 20);
    if (!/^[A-Z0-9\-]+$/.test(cleaned)) {
        throw new Error('Invalid room code format');
    }
    return cleaned;
}

// ============ RATE LIMITING ============

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    const entries = Array.from(rateLimitStore.entries());
    for (const [key, entry] of entries) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Simple in-memory rate limiter.
 * Returns { allowed: true } if under limit, or { allowed: false, retryAfter } if over.
 *
 * @param key - Unique identifier (e.g., IP address or user ID)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
    key: string,
    maxRequests: number = 30,
    windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; retryAfter?: number } {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
        // First request or window expired
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1 };
    }

    entry.count++;

    if (entry.count > maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        return { allowed: false, remaining: 0, retryAfter };
    }

    return { allowed: true, remaining: maxRequests - entry.count };
}

/**
 * Extract client IP from request headers for rate limiting
 */
export function getClientIP(request: Request): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || request.headers.get('cf-connecting-ip')
        || '127.0.0.1';
}
