

// proyecto/proyecto/web/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: "http://localhost:4000/auth/:path*", // proxy al backend
      },
    ]
  },
}

module.exports = nextConfig
