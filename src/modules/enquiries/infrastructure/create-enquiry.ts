import "server-only";
import config from "@payload-config";
import { getPayload } from "payload";
import type { EnquiryFormValues } from "@/modules/enquiries/schemas";

export async function createEnquiry(data: EnquiryFormValues) {
  const payload = await getPayload({ config });
  return payload.create({
    collection: "enquiries",
    data: {
      propertyName: data.propertyName,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone ?? null,
      location: data.location ?? null,
      collaborationType: data.collaborationType ?? null,
      preferredDates: data.preferredDates ?? null,
      participants: data.participants ?? null,
      message: data.message,
      status: "new",
    },
  });
}
