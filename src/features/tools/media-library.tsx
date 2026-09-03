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
import { ImageIcon, Loader2, Trash2, UploadCloud, ZoomIn } from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

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

    case 5:
      return "col-span-2";

    default:
      return "";
  }
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

      if (cancelled) {
        return;
      }

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
        toast.error(`${file.name} must be JPEG, PNG, WebP, or GIF.`);
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

    if (acceptedFiles.length === 0) {
      return;
    }

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
      wrapper={({ children }) => (
        <div className="relative h-max w-full px-4">{children}</div>
      )}
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
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isDragging && "border-foreground/50 bg-muted/60",
                  )}
                >
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
                  <div className="grid auto-rows-40 grid-cols-2 gap-3 xl:grid-cols-3">
                    {media.map((item, index) => {
                      const isDeleting = deleting.has(item.path);

                      return (
                        <article
                          key={item.id}
                          className={cn(
                            "group relative isolate overflow-hidden rounded-2xl border bg-muted",
                            getBentoClass(index),
                          )}
                        >
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => setPreviewItem(item)}
                            className={cn(
                              "absolute inset-0 z-0 size-full cursor-zoom-in overflow-hidden text-left",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80",
                              "disabled:cursor-default",
                            )}
                            aria-label={`Preview ${item.name}`}
                          >
                            {/*biome-ignore lint/performance/noImgElement: dynamic animated media*/}
                            <img
                              src={item.publicUrl}
                              alt={item.name}
                              loading="lazy"
                              className={cn(
                                "size-full object-cover transition duration-300",
                                "group-hover:scale-[1.025]",
                                isDeleting && "opacity-40",
                              )}
                            />

                            <div
                              className={cn(
                                "pointer-events-none absolute inset-0 flex items-center justify-center",
                                "bg-black/0 opacity-0 transition duration-200",
                                "group-hover:bg-black/10 group-hover:opacity-100",
                                "group-focus-within:bg-black/10 group-focus-within:opacity-100",
                              )}
                            >
                              <div className="flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md">
                                <ZoomIn className="size-4" />
                              </div>
                            </div>
                          </button>

                          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/80 via-black/35 to-transparent px-3 pt-12 pb-3">
                            <p className="truncate text-xs font-medium text-white">
                              {item.name}
                            </p>

                            {item.size !== null && (
                              <p className="mt-0.5 text-[11px] text-white/65">
                                {formatBytes(item.size)}
                              </p>
                            )}
                          </div>

                          <div className="absolute top-2 right-2 z-20 flex translate-y-1 items-center gap-1 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
                            <CopyCode
                              data={item.publicUrl}
                              variant="ghost"
                              className="size-9 bg-black/55 text-white backdrop-blur-md hover:bg-black/70 hover:text-white"
                              withToast
                            />

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={isDeleting}
                              onClick={() => void handleDelete(item)}
                              className="size-9 bg-black/55 text-white backdrop-blur-md hover:bg-destructive hover:text-destructive-foreground"
                              aria-label={`Delete ${item.name}`}
                            >
                              {isDeleting ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                            </Button>
                          </div>
                        </article>
                      );
                    })}
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
              {previewItem && (
                <div className="relative flex max-h-[90vh] min-h-0 w-full items-center justify-center overflow-hidden">
                  {/**
                   * biome-ignore lint/performance/noImgElement: dynamic animated media
                   */}
                  <img
                    src={previewItem.publicUrl}
                    alt={previewItem.name}
                    className="max-h-[90vh] max-w-full object-contain"
                  />

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/20 to-transparent px-5 pt-16 pb-5">
                    <p className="truncate pr-8 text-sm font-medium text-white">
                      {previewItem.name}
                    </p>

                    {previewItem.size !== null && (
                      <p className="mt-1 text-xs text-white/60">
                        {formatBytes(previewItem.size)}
                      </p>
                    )}
                  </div>
                </div>
              )}
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
