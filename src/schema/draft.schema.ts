import * as z from "zod";

export const DraftSchema = z.compile(
  z.object({
    banner_image: z.string().nullable(),
    description: z.string().nullable(),
    level: z.number().positive("Difficulty must be greater than 0").max(3),
    tags: z.array(z.string()).nullable(),
    title: z.string().trim().min(1, "Title is required"),
  }),
);

export const PublishableDraftSchema = z.object({
  banner_image: z.string().trim().min(1),
  content: z.string().trim().min(1),
  description: z.string().trim().min(1),
  level: z.number().int(),
  tags: z.array(z.string().trim().min(1)).min(1),
  title: z.string().trim().min(1),
});

export type PublishableDraftInput = z.infer<typeof PublishableDraftSchema>;
export type DraftInput = z.infer<typeof DraftSchema>;
