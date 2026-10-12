import "server-only";
import { listBookableServices as listBookableServicesRow } from "@/modules/booking/infrastructure/list-bookable-services";
import type { Service } from "@/payload-types";

export async function listBookableServices(): Promise<Service[]> {
  return listBookableServicesRow();
}
