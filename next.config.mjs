/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // remotePatterns is the modern way to handle external images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    // If you still want to use the older 'domains' style alongside:
    domains: ["localhost"],
  },
  // Adding transpilePackages to avoid the 'react-is' error we discussed earlier
  transpilePackages: ["recharts"],
};

export default nextConfig;
