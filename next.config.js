/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // CORS Headers for API routes
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Change to your domain for production
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },

  // Prevent ffmpeg-static from being bundled by Next.js
  webpack(config, { isServer }) {
    if (isServer) {
      config.externals.push("ffmpeg-static");
    }
    return config;
  },
};

module.exports = nextConfig;

