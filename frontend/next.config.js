/** @type {import('next').NextConfig} */
const path = require("path");

// BACKEND_URL có thể được cấu hình kèm hậu tố "/api" (ví dụ http://localhost:3000/api)
// hoặc chỉ là origin (ví dụ http://backend:4000). Chuẩn hoá về origin để rewrite bên dưới
// không sinh ra đường dẫn lặp "/api/api/...".
const BACKEND_ORIGIN = (process.env.BACKEND_URL || "http://localhost:3000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
