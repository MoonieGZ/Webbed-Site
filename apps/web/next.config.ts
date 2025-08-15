import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/avatars/:userId/:name",
        destination: "/avatars/:userId/:name",
      },
    ]
  },
}

export default nextConfig
