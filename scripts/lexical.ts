// Hand-built Lexical JSON for seeding richText fields via the Local API.
// Shape matches @lexical/rich-text's ParagraphNode / @lexical/list's
// ListNode + ListItemNode — the node types Payload's default lexicalEditor()
// feature set ships with.

type LexicalTextNode = {
  type: "text";
  detail: number;
  format: number;
  mode: "normal";
  style: string;
  text: string;
  version: number;
};

function textNode(text: string): LexicalTextNode {
  return {
    type: "text",
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    text,
    version: 1,
  };
}

function paragraphNode(text: string) {
  return {
    type: "paragraph",
    children: [textNode(text)],
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    textFormat: 0,
    textStyle: "",
    version: 1,
  };
}

function listItemNode(text: string, value: number) {
  return {
    type: "listitem",
    children: [textNode(text)],
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    value,
    version: 1,
  };
}

function bulletListNode(items: string[]) {
  return {
    type: "list",
    listType: "bullet" as const,
    tag: "ul" as const,
    start: 1,
    children: items.map((item, i) => listItemNode(item, i + 1)),
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    version: 1,
  };
}

/** One richText doc from a sequence of plain paragraphs and/or bullet lists. */
export function richText(
  ...blocks: ({ paragraph: string } | { bulletList: string[] })[]
) {
  const children = blocks.map((block) =>
    "paragraph" in block
      ? paragraphNode(block.paragraph)
      : bulletListNode(block.bulletList),
  );

  return {
    root: {
      type: "root",
      children,
      direction: "ltr" as const,
      format: "" as const,
      indent: 0,
      version: 1,
    },
  };
}
