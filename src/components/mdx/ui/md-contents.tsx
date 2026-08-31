import { Separator } from "@/components/ui/separator";
import type { FC, PropsWithChildren } from "react";

export const MdContents: FC<PropsWithChildren<Record<string, unknown>>> = ({
  children,
}) => (
  <div className="relative w-full bg-transparent md:text-base text-sm **:no-underline my-8">
    <h2 className="font-bold text-3xl tracking-tighter z-50 text-foreground md:pt-0 pt-6">
      Table of Contents
    </h2>
    <Separator className="z-0 mt-2" />
    {children}
  </div>
);
