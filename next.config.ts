import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // Packages pricing now lives on the main site. Permanent 301 so the
        // old /packages route (and any inbound links) land on the new page.
        source: "/packages",
        destination: "https://bleedai.com/pricing",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
