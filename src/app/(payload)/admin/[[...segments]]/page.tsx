import type { Metadata } from "next";
import config from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";
import { connection } from "next/server";

import { importMap } from "../importMap";

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

// Same reason as the (payload) layout: Payload checks the session (JWT
// expiry, i.e. the clock) while rendering, so every admin page is
// request-time and blocking by design.
export const instant = false;

export const generateMetadata = async ({
  params,
  searchParams,
}: Args): Promise<Metadata> => {
  await connection();
  return generatePageMetadata({ config, params, searchParams });
};

const Page = async ({ params, searchParams }: Args) => {
  await connection();
  return RootPage({ config, importMap, params, searchParams });
};

export default Page;
