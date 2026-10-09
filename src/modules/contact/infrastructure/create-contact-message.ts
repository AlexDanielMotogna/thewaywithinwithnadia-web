import "server-only";
import config from "@payload-config";
import { getPayload } from "payload";
import type { ContactFormValues } from "@/modules/contact/schemas";

export async function createContactMessage(data: ContactFormValues) {
  const payload = await getPayload({ config });
  return payload.create({
    collection: "contact-messages",
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      subject: data.subject,
      message: data.message,
      status: "new",
    },
  });
}
