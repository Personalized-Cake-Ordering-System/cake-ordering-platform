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
        ],
      },
};

export default nextConfig;
