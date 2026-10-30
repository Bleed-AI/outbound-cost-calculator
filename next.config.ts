import type { NextConfig } from "next";

// Slot model (2026-10-30): the Sprint and the Growth/Scale packages are retired for new prospects.
// Their public pages now point at the main site. Live from 2026-10-30 (Taha's go).
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
      { source: "/sprint", destination: "https://bleedai.com/outbound/#specialist", permanent: false },
    ];
  },
};

export default nextConfig;
