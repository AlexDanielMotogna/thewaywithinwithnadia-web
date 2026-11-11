import type { CollectionConfig } from "payload";

import { Cta } from "@/payload/blocks/Cta";
import { Hero } from "@/payload/blocks/Hero";
import { Notice } from "@/payload/blocks/Notice";
import { Principles } from "@/payload/blocks/Principles";
import { Quote } from "@/payload/blocks/Quote";
import { ServicesPreview } from "@/payload/blocks/ServicesPreview";
import { TextImage } from "@/payload/blocks/TextImage";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { _status: { equals: "published" } };
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "URL path, e.g. 'philosophy'." },
    },
    {
      name: "blocks",
      type: "blocks",
      blocks: [
        Hero,
        Quote,
        TextImage,
        Principles,
        ServicesPreview,
        Cta,
        Notice,
      ],
    },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "title", type: "text", localized: true },
        { name: "description", type: "textarea", localized: true },
      ],
    },
  ],
};
