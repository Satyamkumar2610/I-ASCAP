
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
        destination: 'https://i-ascap.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
