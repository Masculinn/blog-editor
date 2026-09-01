import { cn } from "@/lib/utils";
import Image from "next/image";
import type { FC } from "react";

type MdImageProps = React.HTMLAttributes<HTMLImageElement> & {
  src?: unknown;
  alt?: string;
};

export const MdImage: FC<MdImageProps> = ({
  src,
  alt,
  className,
  ...props
}: MdImageProps) => {
  if (typeof src !== "string" || !src) {
    throw new Error("MDX parsing error: 'MdImage' src must be a string.");
  }

  const shouldBeFigure =
    (props as Record<string, unknown>)["data-unwrap"] !== undefined ||
    (props as Record<string, unknown>)["data-unwrap"] === "1";

  if (!shouldBeFigure) {
    return (
      <Image
        src={src}
        alt={alt ?? "Unknown image"}
        loading="lazy"
        width={600}
        height={400}
        unoptimized
        className={cn("rounded-md", className)}
        {...props}
      />
    );
  }

  return (
    <figure className="flex flex-col items-center justify-center text-center relative">
      <Image
        src={src}
        alt={alt ?? "Noname image"}
        loading="lazy"
        width={600}
        height={400}
        unoptimized
        className={cn("rounded-md shadow-xl", className)}
        {...props}
      />
      {alt ? (
        <figcaption className="text-muted-foreground italic text-sm">
          {alt}
        </figcaption>
      ) : null}
    </figure>
  );
};
