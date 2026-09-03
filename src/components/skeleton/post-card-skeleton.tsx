import { Skeleton } from "../ui/skeleton";

export function PostLoader() {
  return Array.from({
    length: 4,
  }).map((_, index) => (
    <Skeleton
      // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
      key={index}
      className="h-100 w-full"
    />
  ));
}
