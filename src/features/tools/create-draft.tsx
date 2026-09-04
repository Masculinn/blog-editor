"use client";

import { createDraftAction } from "@/app/actions/drafts.action";
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
import { type DraftInput, DraftSchema } from "@/schema/draft.schema";
import type { ToolComponentProps } from "@/types/tools.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon, PlusIcon } from "lucide-react";
import { useId, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

const DEFAULT_VALUES: DraftInput = {
  banner_image: null,
  description: null,
  level: 1,
  tags: null,
  title: "",
};

function nullableString(value: string) {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function parseTags(value: string) {
  const tags = value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return tags.length > 0 ? Array.from(new Set(tags)) : null;
}

function getPreviewBanner(value: string | null | undefined) {
  if (!value) return null;

  if (value.startsWith("/")) {
    return value;
  }

  try {
    new URL(value);
    return value;
  } catch {
    return null;
  }
}

export function CreateDraft({ render, title }: ToolComponentProps) {
  const formId = useId();
  const [tagsInput, setTagsInput] = useState("");

  const form = useForm<DraftInput>({
    resolver: zodResolver(DraftSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const preview = useWatch({
    control: form.control,
  });

  async function onSubmit(values: DraftInput, close: () => void) {
    const result = await createDraftAction(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Draft created");

    form.reset(DEFAULT_VALUES);
    setTagsInput("");
    close();
  }

  return (
    <Modal
      title={title}
      render={render}
      finalFocus={false}
      className="mx-24 "
      wrapper={({ children }) => (
        <div className="relative h-max w-full overflow-y-hidden px-4">
          {children}
        </div>
      )}
    >
      {({ close }) => (
        <div className="flex w-full items-start gap-8 py-6">
          <form
            id={formId}
            onSubmit={form.handleSubmit((values) => onSubmit(values, close))}
            className="min-w-0 flex-1"
          >
            <FieldGroup>
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-title`}>Title</FieldLabel>

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
                      onBlur={field.onBlur}
                      onChange={(event) =>
                        field.onChange(nullableString(event.target.value))
                      }
                      aria-invalid={fieldState.invalid}
                      placeholder="A short description of the draft..."
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
                      onBlur={field.onBlur}
                      onChange={(event) =>
                        field.onChange(nullableString(event.target.value))
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
                      step={1}
                      value={field.value}
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
                        const value = event.target.value;

                        setTagsInput(value);
                        field.onChange(parseTags(value));
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
            <div className="mt-8 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={form.formState.isSubmitting}
                onClick={() => {
                  form.reset(DEFAULT_VALUES);
                  setTagsInput("");
                  close();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                size="lg"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : (
                  <PlusIcon />
                )}
                Create Draft
              </Button>
            </div>
          </form>
          <div className="sticky top-0 min-w-0 flex-1">
            <div className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Preview
            </div>
            <PostCard
              static
              draft
              title={preview.title}
              description={preview.description}
              level={preview.level}
              tags={preview.tags}
              banner_image={getPreviewBanner(preview.banner_image)}
              className="w-full"
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
