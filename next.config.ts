import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://ai-project-j1x5.onrender.com/:path*',
      },
    ];
  },
};

export default nextConfig;
