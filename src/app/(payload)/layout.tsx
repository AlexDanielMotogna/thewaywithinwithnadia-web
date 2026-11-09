import type { ServerFunctionClient } from "payload";
import config from "@payload-config";
import "@payloadcms/next/css";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import { connection } from "next/server";
import type { ReactNode } from "react";

import { importMap } from "./admin/importMap";

type Args = {
  children: ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

// Cache Components (next.config.ts) tries to prerender every layout, and
// Payload reads the clock (`new Date()`) while rendering the admin. The
// admin is per-user, so it renders at request time (`connection()`), and
// `instant = false` tells Next that blocking on that is intended: there is
// no static shell to stream first.
export const instant = false;

const Layout = async ({ children }: Args) => {
  await connection();
  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  );
};

export default Layout;
