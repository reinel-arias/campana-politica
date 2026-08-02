/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mysql2', 'nodemailer', 'twilio'],
  },
};

export default nextConfig;
