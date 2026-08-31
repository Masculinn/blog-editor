import type { Blockquote, Heading, Image, Link, Paragraph, Root } from "mdast";
import { visit } from "unist-util-visit";

type Attrs = Record<string, string | number | boolean>;

function parseAttrList(raw: string): Attrs {
  const attrs: Attrs = {};
  const re = /([A-Za-z0-9:_-]+)=("([^"]*)"|'([^']*)'|([^"\s]+))/g;

  let execResult: RegExpExecArray | null = re.exec(raw);

  while (execResult !== null) {
    const key = execResult[1];
    const val = execResult[3] ?? execResult[4] ?? execResult[5] ?? "";

    if (/^\d+$/.test(val)) attrs[key] = Number(val);
    else if (val === "true") attrs[key] = true;
    else if (val === "false") attrs[key] = false;
    else attrs[key] = val;

    execResult = re.exec(raw);
  }

  return attrs;
}

const LEADING_BRACKET_RE = /^\s*\[([^\]]+)\]\s*(.*)$/s;
const TRAILING_BRACKET_RE = /^(.*)\s*\[([^\]]+)\]\s*$/s;

/**
 * Supports:
 * - leading bracket attrs for blockquote, heading, paragraph:
 *    > [foo=bar] text...
 *    [foo=bar] This paragraph...
 *    # [foo=bar] Title
 *
 * - trailing bracket attrs for inline image/link inside paragraph:
 *    ![alt](/img.png) [loading=lazy data-credit="me"] (warning: not works well with 'remark-unwrap-image-paragraphs')
 *    [click me](...) [target=_blank rel="noopener"]
 */
export default function remarkAttrsBrackets() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (
        node.type === "blockquote" ||
        node.type === "paragraph" ||
        node.type === "heading"
      ) {
        const first = node?.children[0];
        if (
          !first ||
          (first.type !== "paragraph" &&
            node.type !== "heading" &&
            node.type !== "blockquote")
        ) {
        }
      }
    });

    visit(tree, "blockquote", (node: Blockquote) => {
      if (!node.children?.length) return;
      const first = node.children[0];

      if (first.type !== "paragraph") return;
      const firstText = first?.children[0];

      if (firstText?.type !== "text") return;
      const m = firstText.value.match(LEADING_BRACKET_RE);

      if (!m) return;

      const attrsRaw = m[1];
      const rest = m[2];

      firstText.value = rest;
      node.data ??= {};

      node.data.hProperties = Object.assign(
        node.data.hProperties || {},
        parseAttrList(attrsRaw),
      );
    });

    visit(tree, "heading", (node: Heading) => {
      if (!node.children?.length) return;

      const firstText = node.children[0];
      if (firstText?.type !== "text") return;

      const m = firstText.value.match(LEADING_BRACKET_RE);
      if (!m) return;

      const attrsRaw = m[1];

      firstText.value = m[2];
      node.data ??= {};
      node.data.hProperties = Object.assign(
        node.data.hProperties || {},
        parseAttrList(attrsRaw),
      );
    });

    visit(tree, "paragraph", (node: Paragraph) => {
      if (!node.children?.length) return;
      const firstText = node.children[0];
      if (firstText && firstText.type === "text") {
        const m = firstText.value.match(LEADING_BRACKET_RE);
        if (m) {
          const attrsRaw = m[1];
          firstText.value = m[2];
          node.data ??= {};
          node.data.hProperties = Object.assign(
            node.data.hProperties || {},
            parseAttrList(attrsRaw),
          );
          return;
        }
      }

      const last = node.children[node.children.length - 1];
      const secondLast = node.children[node.children.length - 2];

      if (last && last.type === "text") {
        const m2 = last.value.match(TRAILING_BRACKET_RE);

        if (m2 && secondLast) {
          const attrsRaw = m2[2];
          const left = m2[1];
          last.value = left;

          const attrs = parseAttrList(attrsRaw);

          if (secondLast.type === "image") {
            const img = secondLast as Image;
            img.data ??= {};
            img.data.hProperties = Object.assign(
              img.data.hProperties || {},
              attrs,
            );
            return;
          }

          if (secondLast.type === "link") {
            const link = secondLast as Link;
            link.data ??= {};
            link.data.hProperties = Object.assign(
              link.data.hProperties || {},
              attrs,
            );
            return;
          }

          node.data ??= {};
          node.data.hProperties = Object.assign(
            node.data.hProperties || {},
            attrs,
          );
        }
      }
    });
  };
}
