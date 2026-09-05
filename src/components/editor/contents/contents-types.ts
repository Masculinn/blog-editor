import { z } from "zod";

const labelSchema = z
  .string()
  .trim()
  .min(1, "Enter a link title.")
  .max(300, "Keep link titles under 300 characters.")
  .refine(
    (value) => !/[\r\n]/u.test(value),
    "Link titles must stay on one line.",
  );

const hrefSchema = z
  .string()
  .trim()
  .min(1, "Enter a link destination.")
  .max(2_000, "The link destination is too long.")
  .refine((value) => {
    if (/[\s\\<>\u0000-\u001f\u007f]/u.test(value)) {
      return false;
    }

    if (value.startsWith("#")) {
      return value.length > 1;
    }

    if (value.startsWith("/") && !value.startsWith("//")) {
      return true;
    }

    try {
      const url = new URL(value);

      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Use a #heading-anchor, /relative-path, or HTTP(S) URL.");

export const contentsLinkSchema = z.object({
  id: z.string().min(1),
  label: labelSchema,
  href: hrefSchema,
});

export const contentsSectionSchema = contentsLinkSchema.extend({
  children: z.array(contentsLinkSchema).max(100),
});

export const contentsDataSchema = z
  .object({
    sections: z
      .array(contentsSectionSchema)
      .min(1, "Add at least one section.")
      .max(100, "Use no more than 100 sections."),
  })
  .superRefine((data, context) => {
    const ids = new Set<string>();

    for (const section of data.sections) {
      for (const item of [section, ...section.children]) {
        if (ids.has(item.id)) {
          context.addIssue({
            code: "custom",
            message: "Each contents entry must have a unique ID.",
          });

          return;
        }

        ids.add(item.id);
      }
    }
  });

export type ContentsLink = z.infer<typeof contentsLinkSchema>;

export type ContentsSection = z.infer<typeof contentsSectionSchema>;

export type ContentsData = z.infer<typeof contentsDataSchema>;

export function createContentsLink(): ContentsLink {
  return {
    id: crypto.randomUUID(),
    label: "",
    href: "",
  };
}

export function createContentsSection(): ContentsSection {
  return {
    ...createContentsLink(),
    children: [],
  };
}

export function cloneContentsData(data: ContentsData): ContentsData {
  return {
    sections: data.sections.map((section) => ({
      ...section,
      children: section.children.map((child) => ({ ...child })),
    })),
  };
}

export function moveContentsItem<T>(
  items: readonly T[],
  index: number,
  direction: -1 | 1,
): T[] {
  const target = index + direction;
  const result = [...items];

  if (
    index < 0 ||
    index >= result.length ||
    target < 0 ||
    target >= result.length
  ) {
    return result;
  }

  const [item] = result.splice(index, 1);

  result.splice(target, 0, item);

  return result;
}
