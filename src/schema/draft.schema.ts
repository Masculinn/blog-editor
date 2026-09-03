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

export type DraftInput = z.infer<typeof DraftSchema>;
