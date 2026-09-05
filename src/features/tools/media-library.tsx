"use client";

import {
  deleteMediaAction,
  getMediaAction,
  uploadMediaAction,
} from "@/app/actions/media-library.action";
import { CopyCode } from "@/components/mdx/copy-code";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  ImageOff,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
  ZoomIn,
} from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  type FC,
  type KeyboardEvent,
  type PropsWithChildren,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/confirmation-dialog";
import type { ToolComponentProps } from "../../types/tools.types";

type MediaItem = {
  id: string;
  name: string;
  path: string;
  publicUrl: string;
  createdAt: string | null;
  updatedAt: string | null;
  size: number | null;
  mimeType: string | null;
};

const MAX_FILE_SIZE = 12 * 1024 * 1024;

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function formatBytes(bytes: number | null) {
  if (bytes === null) return null;

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 ** 2) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function getBentoClass(index: number) {
  switch (index % 7) {
    case 0:
      return "col-span-2 row-span-2";

    case 3:
      return "row-span-2";

    case 6:
      return "col-span-2";

    default:
      return "col-span-1 row-span-1";
  }
}

function MediaLibraryWrapper({ children }: PropsWithChildren<unknown>) {
  return <div className="relative h-max w-full px-4">{children}</div>;
}

export function MediaLibrary({ render, title }: ToolComponentProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [deleting, setDeleting] = useState<Set<string>>(() => new Set());
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);

      const result = await getMediaAction();

      if (cancelled) return;

      if (!result.success) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      startTransition(() => {
        setMedia(result.data);
      });

      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function uploadFiles(files: File[]) {
    const acceptedFiles: File[] = [];

    for (const file of files) {
      if (!ACCEPTED_TYPES.has(file.type)) {
        toast.error(`${file.name} must be JPEG, PNG, WebP, AVIF or GIF.`);
        continue;
      }

      if (file.size === 0) {
        toast.error(`${file.name} is empty.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds the 12 MB limit.`);
        continue;
      }

      acceptedFiles.push(file);
    }

    if (acceptedFiles.length === 0) return;

    setUploadingCount((current) => current + acceptedFiles.length);

    try {
      const results = await Promise.all(
        acceptedFiles.map(async (file) => {
          const formData = new FormData();

          formData.set("file", file);

          return uploadMediaAction(formData);
        }),
      );

      const uploaded: MediaItem[] = [];
      const errors: string[] = [];

      for (const result of results) {
        if (result.success) {
          uploaded.push(result.data);
        } else {
          errors.push(result.error);
        }
      }

      if (uploaded.length > 0) {
        startTransition(() => {
          setMedia((current) => [...uploaded, ...current]);
        });

        toast.success(
          uploaded.length === 1
            ? "Image uploaded."
            : `${uploaded.length} images uploaded.`,
        );
      }

      for (const error of errors) {
        toast.error(error);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload images.",
      );
    } finally {
      setUploadingCount((current) =>
        Math.max(0, current - acceptedFiles.length),
      );
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    event.target.value = "";

    void uploadFiles(files);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    event.dataTransfer.dropEffect = "copy";

    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);

    void uploadFiles(files);
  }

  function handleDropZoneKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();

    inputRef.current?.click();
  }

  async function handleDelete(item: MediaItem) {
    setDeleting((current) => {
      const next = new Set(current);

      next.add(item.path);

      return next;
    });

    const result = await deleteMediaAction(item.path);

    if (!result.success) {
      toast.error(result.error);

      setDeleting((current) => {
        const next = new Set(current);

        next.delete(item.path);

        return next;
      });

      return;
    }

    startTransition(() => {
      setMedia((current) =>
        current.filter((mediaItem) => mediaItem.path !== item.path),
      );
    });

    setDeleting((current) => {
      const next = new Set(current);

      next.delete(item.path);

      return next;
    });

    if (previewItem?.path === item.path) {
      setPreviewItem(null);
    }

    toast.success("Image deleted.");
  }

  return (
    <Modal
      title={title}
      render={render}
      finalFocus={false}
      className="m-8"
      wrapper={MediaLibraryWrapper}
    >
      {({ close: _ }) => (
        <>
          <div className="flex max-h-[80vh] min-h-152 flex-col overflow-hidden">
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleInputChange}
            />

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1.75fr)]">
              <div className="flex min-h-0 flex-col">
                {/** biome-ignore lint/a11y/useSemanticElements: dynamic image */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={handleDropZoneKeyDown}
                  onDragEnter={handleDragOver}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "group flex min-h-72 flex-1 cursor-pointer items-center justify-center rounded-2xl border border-dashed p-8 text-center transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ",
                    "m-2 group overflow-hidden relative",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0 left-0 size-full bg-linear-to-b from-transparent to-primary/10 opacity-0 group-focus-visible:opacity-100 group-focus-visible:transition-opacity duration-200",
                      isDragging && "opacity-100",
                    )}
                  />
                  <div className="flex max-w-xs flex-col items-center">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted">
                      {uploadingCount > 0 ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <UploadCloud className="size-5" />
                      )}
                    </div>
                    <p className="text-sm font-medium">
                      {uploadingCount > 0
                        ? `Uploading ${uploadingCount} ${
                            uploadingCount === 1 ? "image" : "images"
                          }…`
                        : "Drop images here"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      or click to browse
                    </p>
                    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                      JPEG, PNG, WebP, and GIF files are converted to WebP at
                      quality 80 before upload. Animated GIF and WebP files
                      preserve their animation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-h-0 overflow-y-scroll pr-1 scrollbar-custom scroll-fade">
                {isLoading ? (
                  <MediaSkeleton />
                ) : media.length === 0 ? (
                  <div className="flex min-h-full flex-col items-center justify-center rounded-2xl border border-dashed text-center">
                    <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-muted">
                      <ImageIcon className="size-5 text-muted-foreground" />
                    </div>

                    <p className="text-sm font-medium">No media yet</p>

                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                      Drop an image on the left and it will appear here
                      automatically.
                    </p>
                  </div>
                ) : (
                  <div className="grid auto-rows-40 grid-cols-2 grid-flow-dense gap-3 xl:grid-cols-3">
                    {media.map((item, index) => (
                      <ImageItem
                        key={item.id}
                        item={item}
                        setPreviewItem={setPreviewItem}
                        isDeleting={deleting.has(item.path)}
                        handleDelete={handleDelete}
                        className={getBentoClass(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Dialog
            open={previewItem !== null}
            onOpenChange={(open) => {
              if (!open) {
                setPreviewItem(null);
              }
            }}
          >
            <DialogContent
              className={cn(
                "w-[calc(100vw-2rem)] max-w-7xl overflow-hidden border-white/10 backdrop-blur-2xl p-0 shadow-2xl ",
                "sm:max-w-7xl",
                "[&>button]:z-30 [&>button]:text-white/70 [&>button]:hover:text-white",
              )}
            >
              {previewItem && <ImageItemPreview {...previewItem} />}
            </DialogContent>
          </Dialog>
        </>
      )}
    </Modal>
  );
}

function MediaSkeleton() {
  return (
    <div className="grid auto-rows-40 grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 9 }, (_, index) => (
        <Skeleton
          // biome-ignore lint/suspicious/noArrayIndexKey: static index list
          key={index}
          className={cn("h-full w-full rounded-2xl", getBentoClass(index))}
        />
      ))}
    </div>
  );
}

type ImageItemProps = {
  item: MediaItem;
  isDeleting: boolean;
  setPreviewItem: React.Dispatch<SetStateAction<MediaItem | null>>;
  handleDelete: (v: MediaItem) => void;
  className?: string;
};

const ImageItem: FC<ImageItemProps> = ({
  item,
  handleDelete,
  isDeleting = false,
  setPreviewItem,
  className,
}) => {
  const [confirmation, setConfirmation] = useState(false);
  const [error, setError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isPreviewFocused, setIsPreviewFocused] = useState(false);
  const name = item.name || "Untitled image";

  const itemSize = item.size ? (
    <p className="mt-0.5 text-[11px] text-white/65">{formatBytes(item.size)}</p>
  ) : null;

  const confirmationDialog = (
    <ConfirmationDialog
      open={confirmation}
      onOpenChange={setConfirmation}
      onConfirm={() => void handleDelete(item)}
      title="Delete image?"
      description={
        <>
          This will permanently delete{" "}
          <span className="font-medium text-foreground">{name}</span>. This
          action cannot be undone.
        </>
      }
      confirmLabel={isDeleting ? "Deleting..." : "Delete"}
      variant="destructive"
      disabled={isDeleting}
    />
  );

  const actions = (
    <div
      className={cn(
        "absolute top-2 right-2 z-40 flex items-center gap-1",
        "translate-y-1 opacity-0 transition-[opacity,transform] duration-200",
        "group-hover:translate-y-0 group-hover:opacity-100",
        "focus-within:translate-y-0 focus-within:opacity-100",
        isDeleting && "pointer-events-none translate-y-0 opacity-0",
      )}
    >
      <CopyCode
        data={item.publicUrl}
        variant="ghost"
        className={cn(
          "size-9 bg-black/55 text-white backdrop-blur-md",
          "hover:bg-black/70 hover:text-white",
        )}
        withToast
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isDeleting}
        onClick={() => setConfirmation(true)}
        className={cn(
          "size-9 bg-black/55 text-white backdrop-blur-md",
          "hover:bg-destructive hover:text-destructive-foreground",
          "focus-visible:ring-destructive",
        )}
        aria-label={`Delete ${name}`}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );

  const deletingOverlay = isDeleting ? (
    <div
      className={cn(
        "absolute inset-0 z-30 grid place-items-center",
        "cursor-wait bg-black/35 backdrop-blur-[2px]",
        "animate-in fade-in duration-200",
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-full",
          "border border-white/15 bg-black/60 px-3 py-2",
          "text-xs font-medium text-white shadow-lg backdrop-blur-md",
        )}
      >
        <Loader2 className="size-3.5 animate-spin" />
        Deleting
      </div>
    </div>
  ) : null;

  if (error) {
    return (
      <>
        <div
          className={cn(
            "group relative isolate flex min-h-40 overflow-hidden rounded-2xl",
            "border border-destructive/20 bg-muted",
            "transition duration-200",
            isDeleting && "cursor-wait",
            className,
          )}
          aria-busy={isDeleting}
        >
          <div
            className={cn(
              "absolute inset-0",
              "bg-[radial-gradient(circle_at_top_right,var(--destructive),transparent_55%)]",
              "opacity-[0.06]",
            )}
            aria-hidden="true"
          />

          <div className="relative z-10 flex size-full min-h-40 flex-col items-center justify-center gap-3 p-5 text-center">
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-2xl",
                "border border-destructive/15 bg-destructive/10",
                "text-destructive shadow-sm",
              )}
            >
              <ImageOff className="size-5" />
            </div>

            <div className="max-w-48 space-y-1">
              <p className="truncate text-sm font-medium text-foreground">
                {name}
              </p>

              <p className="text-xs leading-relaxed text-muted-foreground">
                The image source could not be loaded.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => {
                setIsImageLoaded(false);
                setError(false);
              }}
              className="mt-1 gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </div>

          {actions}
          {deletingOverlay}
        </div>

        {confirmationDialog}
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          "group relative isolate overflow-hidden rounded-2xl border bg-muted",
          "outline-offset-2 transition-[border-color,box-shadow,outline-color] duration-200",
          isPreviewFocused && "outline-2 outline-primary",
          isDeleting && "cursor-wait border-border/50",
          className,
        )}
        aria-busy={isDeleting}
      >
        {!isImageLoaded && (
          <Skeleton className="absolute inset-0 z-10 size-full rounded-none">
            <div className="absolute inset-0 grid place-items-center">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full",
                  "border bg-background/75 text-muted-foreground shadow-sm",
                  "backdrop-blur-sm",
                )}
              >
                <Loader2 className="size-4 animate-spin" />
              </div>
            </div>
          </Skeleton>
        )}

        <button
          type="button"
          data-image-preview
          disabled={isDeleting || !isImageLoaded}
          onFocus={() => setIsPreviewFocused(true)}
          onBlur={() => setIsPreviewFocused(false)}
          onClick={() => setPreviewItem(item)}
          className={cn(
            "group/preview absolute inset-0 z-0 size-full overflow-hidden text-left",
            "cursor-zoom-in focus-visible:outline-none",
            "disabled:cursor-default",
            isDeleting && "disabled:cursor-wait",
          )}
          aria-label={`Preview ${name}`}
        >
          {/* biome-ignore lint/performance/noImgElement: dynamic animated media */}
          <img
            src={item.publicUrl}
            alt={item.id}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            onLoad={() => {
              setError(false);
              setIsImageLoaded(true);
            }}
            onError={() => {
              setIsImageLoaded(false);
              setError(true);
            }}
            className={cn(
              "size-full object-cover",
              "transition-[opacity,transform,filter] duration-300 ease-out",
              !isImageLoaded && "opacity-0",
              isImageLoaded && "opacity-100",
              !isDeleting && [
                "group-hover/preview:scale-[1.025]",
                "group-focus-visible/preview:scale-[1.025]",
              ],
              isDeleting && "scale-[1.02] opacity-40 blur-[1px] grayscale",
            )}
          />

          <div
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center",
              "bg-black/0 opacity-0 transition-[background-color,opacity] duration-200",
              !isDeleting && [
                "group-hover/preview:bg-black/10 group-hover/preview:opacity-100",
                "group-focus-visible/preview:bg-black/10",
                "group-focus-visible/preview:opacity-100",
              ],
            )}
          >
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-full",
                "border border-white/10 bg-black/50 text-white",
                "shadow-lg backdrop-blur-md",
              )}
            >
              <ZoomIn className="size-4" />
            </div>
          </div>
        </button>

        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-20",
            "bg-linear-to-t from-black/80 via-black/35 to-transparent",
            "px-3 pt-12 pb-3",
            "transition-opacity duration-200",
            isDeleting && "opacity-50",
          )}
        >
          <p className="truncate text-xs font-medium text-white">{name}</p>
          {itemSize}
        </div>

        {actions}
        {deletingOverlay}
      </div>

      {confirmationDialog}
    </>
  );
};

function ImageItemPreview({ publicUrl, name, size }: MediaItem) {
  return (
    <div className="relative flex max-h-[90vh] min-h-0 w-full items-center justify-center overflow-hidden">
      {/**
       * biome-ignore lint/performance/noImgElement: dynamic animated media
       */}
      <img
        src={publicUrl}
        alt={name}
        className="max-h-[90vh] max-w-full object-contain"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/20 to-transparent px-5 pt-16 pb-5">
        <p className="truncate pr-8 text-sm font-medium text-white">{name}</p>

        {size !== null && (
          <p className="mt-1 text-xs text-white/60">{formatBytes(size)}</p>
        )}
      </div>
    </div>
  );
}
