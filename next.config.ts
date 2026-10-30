import type { NextConfig } from "next";

// Slot model (2026-10-30): the Sprint and the Growth/Scale packages are retired for new prospects.
// Their public pages now point at the main site. Live only after Taha approves the slot model site.
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/sprint", destination: "https://bleedai.com/outbound/#specialist", permanent: false },
      { source: "/packages", destination: "https://bleedai.com/pricing/", permanent: false },
    ];
  },
};

export default nextConfig;
