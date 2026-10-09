import { notFound } from "next/navigation";
import { getPageBySlug, RenderBlocks } from "@/modules/content";

export default async function JourneyToSelf() {
  const page = await getPageBySlug("journey-to-self");

  if (!page?.blocks || page.blocks.length === 0) {
    notFound();
  }

  return (
    <main className="flex-1">
      <RenderBlocks blocks={page.blocks} />
    </main>
  );
}
