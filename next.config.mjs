/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // On Vercel, `/api` is served by the serverless handler in `/api/index.js`.
    if (process.env.VERCEL) return [];
    const apiBase = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:5000";
    return [{ source: "/api/:path*", destination: `${apiBase}/api/:path*` }];
  },
};

export default nextConfig;
