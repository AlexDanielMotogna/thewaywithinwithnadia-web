import "server-only";
import config from "@payload-config";
import { getPayload } from "payload";
import type { Service } from "@/payload-types";

export async function getServiceById(id: number): Promise<Service | null> {
  const payload = await getPayload({ config });
  try {
    return await payload.findByID({ collection: "services", id });
  } catch {
    return null;
  }
}
