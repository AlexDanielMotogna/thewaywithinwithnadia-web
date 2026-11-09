import type { Metadata } from "next";
import config from "@payload-config";
import { generatePageMetadata, NotFoundPage } from "@payloadcms/next/views";
import { connection } from "next/server";

import { importMap } from "../importMap";

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

// Request-time, like the admin page itself (see page.tsx).
export const generateMetadata = async ({
  params,
  searchParams,
}: Args): Promise<Metadata> => {
  await connection();
  return generatePageMetadata({ config, params, searchParams });
};

const NotFound = async ({ params, searchParams }: Args) => {
  await connection();
  return NotFoundPage({ config, importMap, params, searchParams });
};

export default NotFound;
