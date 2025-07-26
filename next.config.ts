import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'farmui.vercel.app',
        port: '',
        pathname: '/**',
      },
    ],
    // Alternative older syntax (if using Next.js < 12.3.0)
    // domains: ['farmui.vercel.app'],
  },
};

export default nextConfig;
