import { notFound } from "next/navigation";
import { getPageBySlug, RenderBlocks } from "@/modules/content";

export default async function HotelsAndSpas() {
  const page = await getPageBySlug("hotels-spas");

  if (!page?.blocks || page.blocks.length === 0) {
    notFound();
  }

  return (
    <main className="flex-1">
      <RenderBlocks blocks={page.blocks} />
    </main>
  );
}
