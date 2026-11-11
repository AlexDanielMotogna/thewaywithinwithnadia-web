import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // "Journey to Self" became "Philosophy" in the 2026-11 restructure.
  redirects() {
    return Promise.resolve([
      {
        source: "/:locale(en|de)/journey-to-self",
        destination: "/:locale/philosophy",
        permanent: true,
      },
    ]);
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(
  withPayload(nextConfig, { devBundleServerPackages: false }),
);
