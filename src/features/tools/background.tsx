"use client";

import settings from "@/client.settings.json";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PRESETS from "@/constants/backgrounds.data";
import type { ToolComponentProps } from "@/types/tools.types";
import {
  CheckIcon,
  ImagePlusIcon,
  LoaderCircleIcon,
  Trash2Icon,
} from "lucide-react";
import {
  type CSSProperties,
  type ReactNode,
  type SubmitEvent,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
} from "react";
import { toast } from "sonner";

export type Background = {
  id: string;
  name: string;
  image: string;
  url?: string;
};

type SavedBackground = {
  id: string;
  name: string;
  url: string;
};

type BackgroundState = {
  selected: string;
  custom: SavedBackground[];
};

const { changeEventName, maxItem, storageKey } = settings.tools.background;

const DEFAULT_STATE: BackgroundState = {
  selected: "none",
  custom: [],
};

const NONE: Background = {
  id: "none",
  name: "No background",
  image: "none",
};

function normalizeUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.href.length > 2048
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function parseState(raw: string | null): BackgroundState {
  if (!raw) return DEFAULT_STATE;

  try {
    const value: unknown = JSON.parse(raw);

    if (!value || typeof value !== "object") return DEFAULT_STATE;

    const record = value as Record<string, unknown>,
      custom: SavedBackground[] = [],
      ids = new Set<string>();

    if (Array.isArray(record.custom)) {
      for (const item of record.custom) {
        if (!item || typeof item !== "object") continue;

        const entry = item as Record<string, unknown>;

        if (
          typeof entry.id !== "string" ||
          !entry.id.startsWith("custom-") ||
          entry.id.length > 100 ||
          ids.has(entry.id) ||
          typeof entry.name !== "string" ||
          !entry.name.trim() ||
          typeof entry.url !== "string"
        ) {
          continue;
        }

        const url = normalizeUrl(entry.url);
        if (!url) continue;

        ids.add(entry.id);

        custom.push({
          id: entry.id,
          name: entry.name.trim().slice(0, 60),
          url,
        });

        if (custom.length === maxItem) break;
      }
    }

    const selected =
      typeof record.selected === "string" &&
      (record.selected === "none" ||
        PRESETS.some((item) => item.id === record.selected) ||
        custom.some((item) => item.id === record.selected))
        ? record.selected
        : "none";

    return { selected, custom };
  } catch {
    return DEFAULT_STATE;
  }
}

function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function getServerSnapshot(): null {
  return null;
}

function subscribe(listener: () => void) {
  const controller = new AbortController();

  function handleStorage(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) listener();
  }

  window.addEventListener("storage", handleStorage, {
    signal: controller.signal,
  });
  window.addEventListener(changeEventName, listener, {
    signal: controller.signal,
  });

  return () => controller.abort();
}

function useBackgrounds() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const state = parseState(raw);

  const backgrounds: Background[] = [
    NONE,
    ...PRESETS,
    ...state.custom.map((item) => ({
      ...item,
      image: `url(${JSON.stringify(item.url)})`,
    })),
  ];

  return {
    state,
    backgrounds,
    selected: backgrounds.find((item) => item.id === state.selected) ?? NONE,
  };
}

function updateBackgrounds(
  update: (current: BackgroundState) => BackgroundState,
): boolean {
  try {
    const current = parseState(window.localStorage.getItem(storageKey));
    window.localStorage.setItem(storageKey, JSON.stringify(update(current)));
    window.dispatchEvent(new Event(changeEventName));
    return true;
  } catch {
    toast.error("Could not save background settings.", {
      description: "Check that browser storage is available.",
    });
    return false;
  }
}

function backgroundStyle(background: Background): CSSProperties {
  return {
    backgroundImage: background.image,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
}

const loadedImages = new Set<string>();

function preloadImage(url: string): Promise<void> {
  if (loadedImages.has(url)) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const image = new Image();
    let settled = false;

    const timeout = window.setTimeout(() => {
      finish(new Error("Image loading timed out."));
    }, 15_000);

    function finish(error?: Error) {
      if (settled) return;
      settled = true;

      window.clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;

      if (error) {
        reject(error);
      } else {
        loadedImages.add(url);
        resolve();
      }
    }

    image.decoding = "async";
    image.referrerPolicy = "no-referrer";

    image.onload = () => {
      void image.decode().then(
        () => finish(),
        () => finish(new Error("Could not decode this image.")),
      );
    };

    image.onerror = () => finish(new Error("Could not load this image."));
    image.src = url;
  });
}

export function EditorBackground() {
  const [ready, setReady] = useState<Background>(NONE);
  const [shown, setShown] = useState<Background>(NONE);
  const [incoming, setIncoming] = useState<Background | null>(null);
  const [visible, setVisible] = useState(false);

  const {
    selected: { id, name, image, url },
  } = useBackgrounds();

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      try {
        if (url) await preloadImage(url);

        if (!cancelled) {
          setReady({ id, name, image, url });
        }
      } catch {
        if (!cancelled) {
          toast.error("This background could not be loaded.", {
            description: "Your previous background is still displayed.",
          });
        }
      }
    }

    void prepare();

    return () => {
      cancelled = true;
    };
  }, [id, name, image, url]);

  useEffect(() => {
    if (incoming || (ready.id === shown.id && ready.image === shown.image))
      return;

    setIncoming(ready);
  }, [incoming, ready, shown]);

  useEffect(() => {
    if (!incoming) return;

    let secondFrame = 0;
    let timeout = 0;

    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setVisible(true);

        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        timeout = window.setTimeout(
          () => {
            setShown(incoming);
            setIncoming(null);
            setVisible(false);
          },
          reducedMotion ? 0 : 550,
        );
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(timeout);
    };
  }, [incoming]);

  const layerClass =
    "absolute inset-0 transition-opacity duration-500 ease-in-out motion-reduce:transition-none";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className={layerClass}
        style={{
          ...backgroundStyle(shown),
          opacity: incoming && visible ? 0 : 1,
        }}
      />
      {incoming && (
        <div
          key={incoming.id}
          className={layerClass}
          style={{
            ...backgroundStyle(incoming),
            opacity: visible ? 1 : 0,
          }}
        />
      )}
    </div>
  );
}

function BackgroundModalWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="max-h-[78dvh] overflow-y-scroll scrollbar-custom overscroll-contain px-4 pb-4">
      {children}
    </div>
  );
}

function AddBackground({ onBack }: { onBack: () => void }) {
  const formId = useId();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const normalized = normalizeUrl(url);

    if (!normalized) {
      setError("Enter a direct HTTPS image URL.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await preloadImage(normalized);

      const current = parseState(getSnapshot());
      const existing = current.custom.find((item) => item.url === normalized);

      if (!existing && current.custom.length >= maxItem) {
        setError(
          `Remove a custom background before adding more than ${maxItem}.`,
        );
        return;
      }

      const background: SavedBackground = {
        id: existing?.id ?? `custom-${crypto.randomUUID()}`,
        name: name.trim().slice(0, 60) || "Untitled background",
        url: normalized,
      };

      const saved = updateBackgrounds((state) => {
        const duplicate = state.custom.find((item) => item.url === normalized);

        if (duplicate) return { ...state, selected: duplicate.id };

        if (state.custom.length >= maxItem) {
          throw new Error("Custom background limit reached.");
        }

        return {
          selected: background.id,
          custom: [...state.custom, background],
        };
      });

      if (saved) onBack();
    } catch {
      setError(
        "The image could not be loaded. Check that the URL points directly to an accessible image.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5 px-4">
      <div>
        <span className="text-xl font-semibold tracking-tight text-foreground">
          Bring your own atmosphere
        </span>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a landscape, texture, or illustration using a direct image link.
        </p>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor={`${formId}-name`}
          className="text-sm font-medium text-foreground"
        >
          Name
        </Label>
        <Input
          id={`${formId}-name`}
          placeholder="A quiet place"
          maxLength={60}
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={busy}
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor={`${formId}-url`}
          className="text-sm font-medium text-foreground"
        >
          Image URL
        </Label>
        <Input
          id={`${formId}-url`}
          type="url"
          placeholder="https://images.example.com/landscape.jpg"
          required
          maxLength={2048}
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setError("");
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${formId}-error` : undefined}
          disabled={busy}
        />
        <p className="text-xs text-muted-foreground">
          The link is saved in this browser. The image stays on its original
          host.
        </p>
      </div>

      {error && (
        <p
          id={`${formId}-error`}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Button type="submit" disabled={busy || !url.trim()}>
        {busy ? (
          <LoaderCircleIcon className="size-4 motion-safe:animate-spin" />
        ) : (
          <ImagePlusIcon className="size-4" />
        )}
        {busy ? "Checking image…" : "Add and apply"}
      </Button>
    </form>
  );
}

export function Backgrounds({ render, title }: ToolComponentProps) {
  const { state, backgrounds } = useBackgrounds();
  const [confirmation, setConfirmation] = useState(false);

  function removeBackground(id: string) {
    updateBackgrounds((current) => ({
      selected: current.selected === id ? "none" : current.selected,
      custom: current.custom.filter((item) => item.id !== id),
    }));
  }

  return (
    <Modal
      title={title}
      render={render}
      finalFocus={false}
      className="mx-4 sm:mx-12 lg:mx-24"
      wrapper={BackgroundModalWrapper}
    >
      {({ close }) => (
        <>
          <ConfirmationDialog
            open={confirmation}
            onOpenChange={setConfirmation}
            onConfirm={() => setConfirmation(false)}
            title=""
            description={
              <AddBackground onBack={() => setConfirmation(false)} />
            }
            confirmLabel={""}
            variant="destructive"
          />
          <div className="space-y-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-md text-sm text-muted-foreground">
                A little atmosphere for your next article. Choose a background
                to apply it.
              </p>

              <Button
                type="button"
                variant="default"
                onClick={() => setConfirmation(true)}
              >
                <ImagePlusIcon className="size-4" />
                Add a background
              </Button>
            </div>

            {/** biome-ignore lint/a11y/useSemanticElements: false positive */}
            <div
              role="group"
              aria-label="Available backgrounds"
              className="grid grid-cols-2 gap-4 md:grid-cols-3"
            >
              {backgrounds.map((background) => {
                const active = state.selected === background.id;
                const custom = Boolean(background.url);

                return (
                  <div key={background.id} className="min-w-0 space-y-2">
                    <button
                      type="button"
                      aria-label={`Apply ${background.name}`}
                      aria-pressed={active}
                      onClick={() => {
                        updateBackgrounds((current) => ({
                          ...current,
                          selected: background.id,
                        }));
                        close();
                      }}
                      className={[
                        "group relative block aspect-16/10 w-full",
                        "overflow-hidden rounded-xl border bg-muted",
                        "outline-none transition-[transform,box-shadow]",
                        "duration-300 motion-reduce:transition-none",
                        "motion-safe:hover:-translate-y-0.5",
                        "focus-visible:ring-2 focus-visible:ring-ring",
                        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        active
                          ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "border-border hover:shadow-lg",
                      ].join(" ")}
                    >
                      <span
                        className="absolute inset-0"
                        style={backgroundStyle(background)}
                      />

                      {background.id === "none" && (
                        <span className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
                          No Background
                        </span>
                      )}

                      {active && (
                        <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
                          <CheckIcon className="size-4" />
                        </span>
                      )}
                    </button>

                    <div className="flex min-h-8 items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium font-secondary tracking-tighter">
                        {background.name}
                      </span>

                      {custom && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${background.name}`}
                          onClick={() => removeBackground(background.id)}
                        >
                          <Trash2Icon className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
