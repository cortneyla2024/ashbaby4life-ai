/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@ashbaby4life/ai-service',
    '@ashbaby4life/auth',
    '@ashbaby4life/emotion-detection',
    '@ashbaby4life/voice-processing',
    '@ashbaby4life/design-system',
    '@ashbaby4life/utils',
    '@ashbaby4life/analytics',
    '@ashbaby4life/automation',
    '@ashbaby4life/collaboration',
    '@ashbaby4life/database',
    '@ashbaby4life/document-management',
    '@ashbaby4life/file-storage',
    '@ashbaby4life/financial-tracking',
    '@ashbaby4life/goal-tracking',
    '@ashbaby4life/government-resources',
    '@ashbaby4life/health-tracking',
    '@ashbaby4life/learning-tracking',
    '@ashbaby4life/life-hacks',
    '@ashbaby4life/monitoring',
    '@ashbaby4life/notifications',
    '@ashbaby4life/optimization',
    '@ashbaby4life/security',
    '@ashbaby4life/social-network',
    '@ashbaby4life/testing',
  ],
  images: {
    domains: ['localhost', 'vercel.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle Web Speech API polyfills
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Optimize for Vercel deployment
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

export default nextConfig;
