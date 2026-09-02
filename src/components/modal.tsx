"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react";

type ModalTriggerContextType = {
  open: boolean;
  openModal: () => void;
};

const ModalTriggerContext = createContext<ModalTriggerContextType | null>(null);

export function useModalTrigger() {
  const context = useContext(ModalTriggerContext);

  if (context === null) {
    throw new Error("useModalTrigger must be used inside a Modal trigger");
  }

  return context;
}

type ModalProps = {
  children: ({ close }: { close: () => void }) => ReactNode;

  className?: string;
  render?: ReactElement;
  isModal?: boolean;
  title?: string;

  wrapper?: ComponentType<{
    children: ReactNode;
  }>;

  onOpenChange?: (open: boolean) => void;

  finalFocus?: React.ComponentProps<typeof SheetContent>["finalFocus"];
};

export function Modal({
  children,
  className,
  render,
  isModal = true,
  title,
  wrapper: Wrapper,
  onOpenChange,
  finalFocus = false,
}: ModalProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange],
  );

  const openModal = useCallback(() => {
    handleOpenChange(true);
  }, [handleOpenChange]);

  const close = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  const triggerContext = useMemo(
    () => ({
      open,
      openModal,
    }),
    [open, openModal],
  );

  const ModalWrapper = Wrapper ?? Fragment;

  return (
    <Sheet modal={isModal} open={open} onOpenChange={handleOpenChange}>
      {render ? (
        <ModalTriggerContext.Provider value={triggerContext}>
          {render}
        </ModalTriggerContext.Provider>
      ) : (
        <SheetTrigger render={<Button />}>Open</SheetTrigger>
      )}

      <SheetContent
        side="top"
        className={className}
        showCloseButton={false}
        finalFocus={finalFocus}
      >
        {title && (
          <SheetHeader>
            <SheetTitle className="text-4xl tracking-tighter">
              {title}
            </SheetTitle>
          </SheetHeader>
        )}

        <ModalWrapper>
          {children({
            close,
          })}
        </ModalWrapper>
      </SheetContent>
    </Sheet>
  );
}
