/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Enable React strict mode for surfacing potential problems during development.
   */
  reactStrictMode: true,

  /**
   * Opt-in to the Next.js App Router (stable in Next 14).
   * Remove this line when upgrading to Next 15+ where it is the default.
   */
  experimental: {
    // serverActions: true, // Already stable in Next 14 — uncomment if needed
  },

  /**
   * Transpile internal workspace packages that ship raw TypeScript/ESM source.
   * Add new @devsync/* packages here as they are created.
   */
  transpilePackages: ['@devsync/shared-ui', '@devsync/shared-types', '@devsync/shared-config'],

  /**
   * Custom HTTP response headers for every route.
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
