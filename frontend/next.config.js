/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://resumeai-6y80.onrender.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;