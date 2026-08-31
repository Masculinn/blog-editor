import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { Fragment } from "react";

type HTMLAttributes<T> = React.HTMLAttributes<T>;

type HeadingProps = {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
} & HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants>;

const headingVariants = cva(
  [
    "relative font-bold leading-tight tracking-tighter text-foreground",
    "cursor-pointer transition-all duration-200 ease-in-out",
    "hover:underline underline-offset-4 **:no-underline",
    "hover:text-accent-foreground",
    "before:absolute",
    "before:content-['#']",
    "before:opacity-0",
    "before:-left-5",
    "before:top-9",
    "before:-translate-y-1/2",
    "before:-translate-x-1/2",
    "before:font-normal",
    "before:text-foreground",
    "hover:before:opacity-100",
    "before:transition-opacity",
    "before:duration-200",
  ],
  {
    variants: {
      variant: {
        h1: "text-5xl pb-4 pt-6",
        h2: "text-4xl pt-5",
        h3: "text-3xl pt-4",
        h4: "text-2xl",
        h5: "text-xl",
        h6: "text-lg",
      },
    },
  },
);

export const MdHeading = ({
  as: Component = "h1",
  className,
  ...props
}: HeadingProps) => {
  console.debug("MdHeading", props);
  const Wrapper = typeof props.id === "string" ? Link : Fragment;
  return (
    <Wrapper
      href={`#${props.id}`}
      className={cn(typeof props.id === "string" && "group focus:outline-none")}
    >
      <Component
        className={cn(
          headingVariants({ variant: Component }),
          className,
          typeof props.id === "string" &&
            "group-focus-visible:ring-2 group-focus-visible:ring-primary/30 group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-background focus-visible:rounded-2xl",
          typeof props.id === "string" &&
            "group-focus-visible:before:translate-x-0 group-focus-visible:before:opacity-100",
        )}
        {...props}
      />
    </Wrapper>
  );
};
