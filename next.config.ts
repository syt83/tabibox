import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /trips/new belonged to the pre-Phase-3 trip system, which has no
      // "create trip" flow visible anywhere in the UI anymore (see
      // src/lib/trip-mutations.ts) — only reachable by typing the old URL
      // directly. Send it to the live system's equivalent instead.
      {
        source: "/trips/new",
        destination: "/trip/new",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
