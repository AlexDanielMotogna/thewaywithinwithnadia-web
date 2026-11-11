import "server-only";
import {
  getBookableServiceBySlug as getBookableServiceBySlugRow,
  listBookableServices as listBookableServicesRow,
  type ContentLocale,
} from "@/modules/booking/infrastructure/list-bookable-services";
import type { Service } from "@/payload-types";

export async function listBookableServices(
  locale: ContentLocale,
): Promise<Service[]> {
  return listBookableServicesRow(locale);
}

export async function getBookableServiceBySlug(
  slug: string,
  locale: ContentLocale,
): Promise<Service | null> {
  return getBookableServiceBySlugRow(slug, locale);
}
