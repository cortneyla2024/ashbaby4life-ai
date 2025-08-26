/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@vitality/ai-service',
    '@vitality/auth',
    '@vitality/emotion-detection',
    '@vitality/voice-processing',
    '@vitality/design-system',
    '@vitality/utils',
    '@vitality/analytics',
    '@vitality/automation',
    '@vitality/collaboration',
    '@vitality/database',
    '@vitality/document-management',
    '@vitality/file-storage',
    '@vitality/financial-tracking',
    '@vitality/goal-tracking',
    '@vitality/government-resources',
    '@vitality/health-tracking',
    '@vitality/learning-tracking',
    '@vitality/life-hacks',
    '@vitality/monitoring',
    '@vitality/notifications',
    '@vitality/optimization',
    '@vitality/security',
    '@vitality/social-network',
    '@vitality/testing',
  ],
  images: {
    domains: ['localhost'],
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
};

export default nextConfig;

