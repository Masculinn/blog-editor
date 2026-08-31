import type { Image, Link, Paragraph, Parent, Root } from "mdast";
import { visit } from "unist-util-visit";

export default function remarkUnwrapImageParagraphs() {
  return function transformer(tree: Root, _file?: unknown) {
    (visit as unknown as typeof visit)(
      tree,
      "paragraph",
      (
        node: Paragraph,
        index: number | null | undefined,
        parent: Parent | null | undefined,
      ) => {
        if (!parent || typeof index !== "number") return;

        const children = node.children;
        if (children?.length !== 1) return;

        const only = children[0];

        if (only.type === "image") {
          const img = only as Image;
          img.data ??= {};
          img.data.hProperties = Object.assign(img.data.hProperties || {}, {
            "data-unwrap": "1",
          });

          const replacement = {
            ...img,
            position: img.position ?? node.position,
          };

          parent.children.splice(index, 1, replacement);
          return;
        }

        if (only.type === "link") {
          const link = only as Link;

          if (
            link.children &&
            link.children.length === 1 &&
            link.children[0].type === "image"
          ) {
            const innerImage = link.children[0] as Image;
            innerImage.data ??= {};
            innerImage.data.hProperties = Object.assign(
              innerImage.data.hProperties || {},
              {
                "data-unwrap": "1",
              },
            );

            const replacement = {
              ...link,
              position: link.position ?? node.position,
            };

            parent.children.splice(index, 1, replacement);
            return;
          }
        }
      },
    );
  };
}
