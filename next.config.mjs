/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/digital-dynamo-cb555.appspot.com/**',
      },
      {
        protocol: 'https',
        hostname: 'img.vietqr.io',
        pathname: '/image/**',
      }
    ],
    domains: ['img.vietqr.io'],
  },
};

export default nextConfig;
