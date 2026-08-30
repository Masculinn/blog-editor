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
        "overflow-y-scroll scrollbar-custom bg-transparent rounded-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
