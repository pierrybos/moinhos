/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
