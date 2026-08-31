import Link from "next/link";
import type { JSX } from "react";

export type AnchorProps = JSX.IntrinsicElements["a"];

const refSource = "burakdev.com";

function getHref(href: string | undefined): {
  finalHref: string;
  isExternal: boolean;
} {
  let finalHref = "";

  const safeHref = typeof href === "string" ? href.trim() : "";
  const isExternal = /^https?:\/\//i.test(safeHref);

  if (!isExternal || !safeHref)
    return {
      finalHref: safeHref,
      isExternal,
    };
  try {
    const url = new URL(safeHref);
    if (!url.searchParams.has("ref")) {
      url.searchParams.append("ref", refSource);
    }
    finalHref = url.toString();
  } catch {
    finalHref = safeHref;
  }

  return {
    finalHref,
    isExternal,
  };
}

export const MdAnchor = ({ href, ...props }: AnchorProps) => {
  if (!href) return null;
  const { finalHref, isExternal } = getHref(href);

  const defaultExternalAttrs = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={finalHref}
      className="underline underline-offset-4 hover:text-primary transition-colors duration-200"
      {...defaultExternalAttrs}
      {...props}
    />
  );
};
