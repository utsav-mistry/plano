import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Keep admin URLs while serving existing dashboard modules
      { source: '/admin/:path+', destination: '/:path+' },
    ];
  },
};

export default nextConfig;
