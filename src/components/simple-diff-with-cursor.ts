export default function simpleDiffWithCursor(
  a: string,
  b: string,
  cursor: number,
): { index: number; insert: string; remove: number } {
  const aLength = a.length;
  const bLength = b.length;
  let left = 0;
  let right = 0;

  while (
    left < aLength &&
    left < bLength &&
    a[left] === b[left] &&
    left < cursor
  ) {
    left++;
  }
  while (
    right + left < aLength &&
    right + left < bLength &&
    a[aLength - right - 1] === b[bLength - right - 1]
  ) {
    right++;
  }
  while (
    right + left < aLength &&
    right + left < bLength &&
    a[left] === b[left]
  ) {
    left++;
  }
  return {
    index: left,
    insert: b.slice(left, bLength - right),
    remove: aLength - left - right,
  };
}
