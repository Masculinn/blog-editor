import type { PrismTheme } from "prism-react-renderer";

export default {
  plain: {
    color: "#fff", // primary text color (pulled from image)
    backgroundColor: "oklch(0.141 0.005 285.823)", // deep near-black background (pulled)
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "#7C8796", fontWeight: "400" }, // muted gray for comments
    },
    { types: ["punctuation"], style: { color: "#94A3B8" } }, // neutral punctuation
    {
      types: ["tag", "boolean", "number", "constant", "symbol"],
      style: { color: "#DD4F7D" }, // warm red for keywords/numbers/constants
    },
    {
      types: ["selector", "string", "char", "builtin", "url"],
      style: { color: "#FAC760" }, // yellow/orange for strings and selectors
    },
    {
      types: ["attr-name"],
      style: { color: "#F4A627" }, // attribute names (slightly darker yellow)
    },
    {
      types: ["property"],
      style: { color: "#43AAF9" }, // bright blue for property names / links
    },
    {
      types: ["function", "class-name", "maybe-class-name"],
      style: { color: "#DCE3EA" }, // light text for function/class names (keeps contrast)
    },
    { types: ["keyword", "operator"], style: { color: "#DD4F7D" } }, // keywords red
    { types: ["deleted"], style: { color: "#DD4F7D" } }, // deleted / removed in red
    { types: ["inserted"], style: { color: "#5BD1B9" } }, // inserted / success green
    { types: ["regex", "important"], style: { color: "#FFB0A8" } }, // regex / important highlight
    { types: ["variable"], style: { color: "#FF9AA2" } }, // variables / softly pink
  ],
} as const satisfies PrismTheme;
