import { cn } from "@/lib/utils";

export function DocumentViewer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-y-scroll scrollbar-custom bg-transparent scroll-fade",
        className,
      )}
    >
      {children}
    </div>
  );
}
