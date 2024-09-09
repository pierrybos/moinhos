/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;
