/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://sahara-app.vercel.app/:path*",
      },
    ];
  },
};
