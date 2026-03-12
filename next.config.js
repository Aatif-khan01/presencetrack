const nextConfig = {
    output: 'standalone',
    images: {
        unoptimized: true,
    },
    experimental: {
        serverComponentsExternalPackages: ['mongodb'],
    },
    webpack(config, { dev }) {
        if (dev) {
            config.watchOptions = {
                poll: 2000,
                aggregateTimeout: 300,
                ignored: ['**/node_modules'],
            };
        }
        return config;
    },
    onDemandEntries: {
        maxInactiveAge: 10000,
        pagesBufferLength: 2,
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    // Prevent clickjacking — deny all framing
                    { key: "X-Frame-Options", value: "DENY" },
                    // Strict Content Security Policy
                    { key: "Content-Security-Policy", value: "frame-ancestors 'none'; default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.firebase.googleapis.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; object-src 'none'; base-uri 'self'; form-action 'self';" },
                    // Prevent MIME type sniffing
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    // Enable XSS filter
                    { key: "X-XSS-Protection", value: "1; mode=block" },
                    // Control referrer information
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    // Restrict permissions/features
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
                    // Force HTTPS (uncomment in production with actual SSL)
                    // { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
                    // Allow cross-origin popups for Firebase Auth
                    { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
                ],
            },
            {
                // CORS only for API routes, restricted origins
                source: "/api/(.*)",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: process.env.CORS_ORIGINS || "https://presencetrack.vercel.app" },
                    { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
                    { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
