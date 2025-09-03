import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "r2.pokefarm.com",
        port: "",
        pathname: "/img/**",
      },
    ],
  },
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
