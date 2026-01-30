
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,

  // Image optimization
  images: {
    minimumCacheTTL: 60,
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? 'http://127.0.0.1:8000/api/:path*'
          : 'https://i-ascap.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
