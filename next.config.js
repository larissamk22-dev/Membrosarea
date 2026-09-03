/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // As miniaturas das aulas vêm do Panda Video.
    remotePatterns: [{ protocol: 'https', hostname: '**.pandavideo.com.br' }],
  },
};
module.exports = nextConfig;
