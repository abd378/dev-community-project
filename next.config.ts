/** @type {import('next').NextConfig} */

const nextConfig = {
  allowedDevOrigins: [
    "http://172.20.10.2:3000",
    "http://192.168.1.102:3000",
    "https://*.serveo.net",
    "https://*.loca.lt",
  ],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=()",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;