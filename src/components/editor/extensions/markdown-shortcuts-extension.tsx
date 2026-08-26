import { effect, namedSignals } from "@lexical/extension";
import { registerMarkdownShortcuts, type Transformer } from "@lexical/markdown";
import { defineExtension, safeCast } from "lexical";

export const MarkdownShortcutsExtension = defineExtension({
  build: (_, config) => namedSignals(config),

  config: safeCast<{
    transformers: Array<Transformer>;
  }>({
    transformers: [],
  }),

  name: "MarkdownShortcuts",

  register: (editor, _, state) =>
    effect(() => {
      return registerMarkdownShortcuts(
        editor,
        state.getOutput().transformers.value,
      );
    }),
});
