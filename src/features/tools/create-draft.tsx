"use client";

import {
  createDraftAction,
  getDraftAction,
  upsertDraftAction,
  type DraftWithoutContent,
} from "@/app/actions/drafts.action";
import {
  getPostAction,
  upsertPostAction,
  type BlogWithoutContent,
} from "@/app/actions/posts.action";
import { PostCard } from "@/components/blog/post-card";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DraftSchema,
  PublishableDraftSchema,
  type DraftInput,
} from "@/schema/draft.schema";
import type { Blog, Draft } from "@/types/db.types";
import type { ToolComponentProps } from "@/types/tools.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon, PencilIcon, PlusIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

type CreateDraftProps = ToolComponentProps &
  (
    | {
        type?: undefined;
        id?: never;
        onSaved?: (draft: DraftWithoutContent) => void;
      }
    | {
        type: "draft";
        id: Draft["id"];
        onSaved?: (draft: Draft) => void;
      }
    | {
        type: "post";
        id: Blog["id"];
        onSaved?: (post: BlogWithoutContent) => void;
      }
  );

const DEFAULT_VALUES: DraftInput = {
  banner_image: null,
  description: null,
  level: 1,
  tags: null,
  title: "",
};

const PostMetadataSchema = PublishableDraftSchema.omit({ content: true });

function DraftModalWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="relative max-h-[80dvh] w-full overflow-y-auto px-4">
      {children}
    </div>
  );
}

function nullableString(value: string) {
  return value.trim() || null;
}

function parseTags(value: string) {
  const tags = value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return tags.length ? Array.from(new Set(tags)) : null;
}

function toFormValues(
  record: Pick<
    DraftWithoutContent,
    "banner_image" | "description" | "level" | "tags" | "title"
  >,
): DraftInput {
  return {
    banner_image: record.banner_image,
    description: record.description,
    level: record.level ?? 1,
    tags: record.tags,
    title: record.title ?? "",
  };
}

function getPreviewBanner(value: string | null | undefined) {
  if (!value) return null;
  if (value.startsWith("/")) return value;

  try {
    new URL(value);
    return value;
  } catch {
    return null;
  }
}

export function CreateDraft(props: CreateDraftProps) {
  const { render, title, type, id } = props;
  const formId = useId();
  const editing = type !== undefined;
  const recordLabel = type === "post" ? "post" : "draft";

  const [open, setOpen] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<DraftInput>(DEFAULT_VALUES);

  const [retry, setRetry] = useState(0);
  const [loadedAttempt, setLoadedAttempt] = useState<number | null>(null);
  const loaded = loadedAttempt === retry;

  const sessionRef = useRef(0);
  const submittingRef = useRef(false);

  const form = useForm<DraftInput>({
    resolver: zodResolver(DraftSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const { reset, trigger } = form;
  const { isSubmitting, isValid, isDirty } = form.formState;
  const preview = useWatch({ control: form.control });
  const parsedPreview = DraftSchema.safeParse(preview);
  const parsedBaseline = DraftSchema.safeParse(baseline);
  const postValidation = PostMetadataSchema.safeParse(preview);

  const hasChanges =
    isDirty &&
    parsedPreview.success &&
    (!parsedBaseline.success ||
      JSON.stringify(parsedPreview.data) !==
        JSON.stringify(parsedBaseline.data));

  const busy = isSubmitting || (editing && !loaded);
  const canSubmit =
    !busy &&
    isValid &&
    (type !== "post" || postValidation.success) &&
    (!editing || hasChanges);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    sessionRef.current += 1;
    setLoadedAttempt(null);
    setLoadError(null);
    setOpen(nextOpen);
  }, []);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const session = ++sessionRef.current;

    setLoadedAttempt(null);
    setLoadError(null);

    function applyValues(values: DraftInput) {
      reset(values);
      setBaseline(values);
      setTagsInput(values.tags?.join(", ") ?? "");
      setLoadedAttempt(retry);
      void trigger();
    }

    if (type === undefined) {
      applyValues(DEFAULT_VALUES);

      return () => {
        cancelled = true;
      };
    }

    reset(DEFAULT_VALUES);
    setTagsInput("");

    async function loadRecord() {
      if (id === undefined) {
        setLoadError(`Invalid ${recordLabel} ID.`);
        return;
      }

      try {
        const result =
          type === "post" ? await getPostAction(id) : await getDraftAction(id);

        if (cancelled || session !== sessionRef.current) return;

        if (!result.success) {
          setLoadError(result.error);
          return;
        }

        applyValues(toFormValues(result.data));
      } catch {
        if (!cancelled && session === sessionRef.current) {
          setLoadError(`Failed to fetch ${recordLabel}.`);
        }
      }
    }

    void loadRecord();

    return () => {
      cancelled = true;
    };
  }, [open, type, id, retry, recordLabel, reset, trigger]);

  async function onSubmit(values: DraftInput, close: () => void) {
    if (submittingRef.current || !canSubmit) return;

    submittingRef.current = true;
    const session = sessionRef.current;
    const input: DraftInput = {
      ...values,
      banner_image: nullableString(values.banner_image ?? ""),
      description: nullableString(values.description ?? ""),
    };

    try {
      let savedValues: DraftInput;

      if (props.type === "post") {
        const result = await upsertPostAction(props.id, input);

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        savedValues = toFormValues(result.data);
        props.onSaved?.(result.data);
      } else if (props.type === "draft") {
        const result = await upsertDraftAction(props.id, input);

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        savedValues = toFormValues(result.data);
        props.onSaved?.(result.data);
      } else {
        const result = await createDraftAction(input);

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        savedValues = DEFAULT_VALUES;
        props.onSaved?.(result.data);
      }

      toast.success(
        editing
          ? `${type === "post" ? "Post" : "Draft"} updated.`
          : "Draft created.",
      );

      if (session === sessionRef.current) {
        reset(savedValues);
        setBaseline(savedValues);
        setTagsInput(savedValues.tags?.join(", ") ?? "");
        close();
      }
    } catch {
      toast.error(
        editing
          ? `Failed to update ${recordLabel}.`
          : "Failed to create draft.",
      );
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <Modal
      title={title}
      render={render}
      finalFocus={false}
      className="mx-4 sm:mx-12 lg:mx-24"
      onOpenChange={handleOpenChange}
      wrapper={DraftModalWrapper}
    >
      {({ close }) =>
        editing && !loaded ? (
          <div
            className="flex min-h-72 flex-col items-center justify-center gap-4 py-8 text-center"
            aria-live="polite"
          >
            {loadError ? (
              <>
                <p role="alert" className="text-sm text-destructive">
                  {loadError}
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={close}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setLoadError(null);
                      setRetry((current) => current + 1);
                    }}
                  >
                    Try again
                  </Button>
                </div>
              </>
            ) : (
              <>
                <LoaderCircleIcon className="size-5 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Loading {recordLabel}...
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="flex w-full flex-col items-start gap-8 py-6 lg:flex-row">
            <form
              id={formId}
              onSubmit={form.handleSubmit((values) => onSubmit(values, close))}
              className="min-w-0 w-full flex-1"
              noValidate
            >
              <fieldset disabled={busy} className="min-w-0 space-y-6">
                <FieldGroup>
                  <Controller
                    name="title"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={`${formId}-title`}>
                          Title
                        </FieldLabel>
                        <Input
                          {...field}
                          id={`${formId}-title`}
                          aria-invalid={fieldState.invalid}
                          placeholder="Understanding React Server Components"
                          autoComplete="off"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={`${formId}-description`}>
                          Description
                        </FieldLabel>
                        <Textarea
                          ref={field.ref}
                          id={`${formId}-description`}
                          name={field.name}
                          value={field.value ?? ""}
                          onBlur={(event) => {
                            field.onChange(nullableString(event.target.value));
                            field.onBlur();
                          }}
                          onChange={(event) =>
                            field.onChange(event.target.value || null)
                          }
                          aria-invalid={fieldState.invalid}
                          placeholder={`A short description of the ${recordLabel}...`}
                          className="min-h-24 resize-none"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="banner_image"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={`${formId}-banner`}>
                          Banner image
                        </FieldLabel>
                        <Input
                          ref={field.ref}
                          id={`${formId}-banner`}
                          name={field.name}
                          type="url"
                          value={field.value ?? ""}
                          onBlur={(event) => {
                            field.onChange(nullableString(event.target.value));
                            field.onBlur();
                          }}
                          onChange={(event) =>
                            field.onChange(event.target.value || null)
                          }
                          aria-invalid={fieldState.invalid}
                          placeholder="https://"
                          autoComplete="off"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="level"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={`${formId}-level`}>
                          Difficulty
                        </FieldLabel>
                        <Input
                          ref={field.ref}
                          id={`${formId}-level`}
                          name={field.name}
                          type="number"
                          min={1}
                          max={3}
                          step={1}
                          value={
                            Number.isFinite(field.value) ? field.value : ""
                          }
                          onBlur={field.onBlur}
                          onChange={(event) =>
                            field.onChange(event.target.valueAsNumber)
                          }
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="tags"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={`${formId}-tags`}>Tags</FieldLabel>
                        <Input
                          ref={field.ref}
                          id={`${formId}-tags`}
                          name={field.name}
                          value={tagsInput}
                          onBlur={field.onBlur}
                          onChange={(event) => {
                            setTagsInput(event.target.value);
                            field.onChange(parseTags(event.target.value));
                          }}
                          aria-invalid={fieldState.invalid}
                          placeholder="react, typescript, nextjs"
                          autoComplete="off"
                        />
                        <FieldDescription>
                          Separate tags using commas.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
                {type === "post" && !postValidation.success && (
                  // biome-ignore lint/a11y/useSemanticElements: false positive
                  <p role="status" className="text-sm text-muted-foreground">
                    Published posts require a title, description, banner image,
                    at least one tag, and a whole-number difficulty from 1 to 3.
                  </p>
                )}
              </fieldset>
              <div className="mt-8 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={close}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  disabled={!canSubmit}
                >
                  {isSubmitting ? (
                    <LoaderCircleIcon className="size-4 animate-spin" />
                  ) : editing ? (
                    <PencilIcon className="size-4" />
                  ) : (
                    <PlusIcon className="size-4" />
                  )}
                  {editing ? "Save changes" : "Create Draft"}
                </Button>
              </div>
            </form>
            <div className="top-0 min-w-0 w-full flex-1 lg:sticky">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Preview
              </div>
              <PostCard
                static
                title={preview.title}
                description={preview.description}
                level={preview.level}
                tags={preview.tags}
                banner_image={getPreviewBanner(preview.banner_image)}
                className="w-full"
              />
            </div>
          </div>
        )
      }
    </Modal>
  );
}
