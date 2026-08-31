import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React, {
  Children,
  isValidElement,
  useId,
  type FC,
  type PropsWithChildren,
  type ReactElement,
} from "react";

export const MdSummary: FC<PropsWithChildren<Record<string, unknown>>> = ({
  children,
}) => children;

type DetailsProps = PropsWithChildren<Record<string, unknown>> & {
  className?: string;
};

export const MdDetails: FC<DetailsProps> = ({
  children,
  className,
  ...rest
}) => {
  const all = Children.toArray(children);

  const meaningful = all.filter((c) => {
    if (typeof c === "string") return c.trim().length > 0;
    if (typeof c === "number") return true;
    return true;
  });

  if (meaningful.length === 0) {
    throw new Error(
      "Parse error during MDX compilation: 'MdDetails' must have at least one child",
    );
  }

  const first = meaningful[0] as ReactElement | string | number;

  let triggerContent: React.ReactNode;
  let contentChildren: React.ReactNode[] = [];

  const isSummaryElement =
    isValidElement(first) &&
    (first.type === MdSummary ||
      (typeof first.type === "string" &&
        first.type.toLowerCase() === "summary"));

  if (isSummaryElement) {
    triggerContent = (first as ReactElement as { props: { children: string } })
      .props.children;
    contentChildren = meaningful.slice(1);
  } else {
    triggerContent = first;
    contentChildren = meaningful.slice(1);
  }

  const id = useId();

  return (
    <Card
      className={cn(
        "my-4 px-6 py-1 bg-transparent dark:border-rose-500/50 border-rose-500",
        className,
      )}
    >
      <Accordion multiple={false} {...rest}>
        <AccordionItem value={id}>
          <AccordionTrigger className="relative">
            <div className="inline-block text-foreground text-base">
              {triggerContent}
            </div>
          </AccordionTrigger>
          <AccordionContent>{contentChildren}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default MdDetails;
