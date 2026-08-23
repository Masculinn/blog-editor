export function caretFromPoint(
  x: number,
  y: number,
): null | {
  offset: number;
  node: Node;
} {
  if (
    typeof document === "undefined" ||
    typeof document.caretPositionFromPoint !== "function"
  ) {
    return null;
  }

  const position = document.caretPositionFromPoint(x, y);

  if (position === null) {
    return null;
  }

  return {
    node: position.offsetNode,
    offset: position.offset,
  };
}
