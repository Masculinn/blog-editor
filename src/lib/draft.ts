import {
  type PublishableDraftInput,
  PublishableDraftSchema,
} from "@/schema/draft.schema";

const FIELD_LABELS = {
  banner_image: "Banner image",
  content: "Content",
  description: "Description",
  level: "Level",
  tags: "Tags",
  title: "Title",
} satisfies Record<keyof PublishableDraftInput, string>;

export function getDraftPublishIssues(input: unknown): string[] {
  const result = PublishableDraftSchema.safeParse(input);

  if (result.success) {
    return [];
  }

  const issues = result.error.issues.map((issue) => {
    const field = issue.path[0];

    if (typeof field !== "string" || !(field in FIELD_LABELS)) {
      return issue.message;
    }

    const label = FIELD_LABELS[field as keyof typeof FIELD_LABELS];

    if (field === "tags") {
      return "At least one valid tag is required.";
    }

    if (field === "level") {
      return "Level must be a valid integer.";
    }

    return `${label} is required.`;
  });

  return [...new Set(issues)];
}
