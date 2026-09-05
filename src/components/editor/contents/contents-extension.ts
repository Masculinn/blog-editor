import { defineExtension } from "lexical";

import { ContentsNode } from "./contents-node";

export const ContentsExtension = defineExtension({
  name: "editor/contents",
  nodes: [ContentsNode],
});
