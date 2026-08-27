"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { type JSX, useState } from "react";

export function PostCardModal({
  children,
  className,
  render,
  isModal = true,
  title,
}: {
  children: ({ close }: { close: () => void }) => React.ReactNode;
  className?: string;
  render?: JSX.Element;
  isModal?: boolean;
  title?: string;
}) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <Sheet modal={isModal} onOpenChange={setOpen} open={open}>
      <SheetTrigger
        render={render ?? <Button variant="outline">Open</Button>}
      />
      <SheetContent side="top" className={className} showCloseButton={false}>
        {title && (
          <SheetHeader>
            <SheetTitle className="text-4xl tracking-tighter ">
              {title}
            </SheetTitle>
          </SheetHeader>
        )}
        <div className="w-full h-max relative overflow-y-hidden px-4">
          <div className="flex md:flex-row flex-col gap-4 w-full scrollbar-custom overflow-x-scroll">
            {children({
              close,
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
