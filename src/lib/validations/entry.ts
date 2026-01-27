import { z } from "zod";

export const CATEGORIES = [
  "STORY",
  "BIRTH",
  "DEATH",
  "WEDDING",
  "GRADUATION",
  "MIGRATION",
  "MILITARY",
  "CAREER",
  "TRADITION",
  "RECIPE",
  "PHOTO_MEMORY",
  "DOCUMENT",
  "OTHER",
] as const;

export const DATE_PRECISIONS = ["DECADE", "YEAR", "MONTH", "DAY"] as const;

export const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  STORY: "Story",
  BIRTH: "Birth",
  DEATH: "Death",
  WEDDING: "Wedding",
  GRADUATION: "Graduation",
  MIGRATION: "Migration",
  MILITARY: "Military",
  CAREER: "Career",
  TRADITION: "Tradition",
  RECIPE: "Recipe",
  PHOTO_MEMORY: "Photo Memory",
  DOCUMENT: "Document",
  OTHER: "Other",
};

export const entryFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(50000),
  summary: z.string().max(500).optional().nullable(),
  eventDate: z.string().optional().nullable(),
  eventDateEnd: z.string().optional().nullable(),
  dateApproximate: z.coerce.boolean().default(false),
  datePrecision: z.enum(DATE_PRECISIONS).default("DAY"),
  era: z.string().max(100).optional().nullable(),
  category: z.enum(CATEGORIES).default("STORY"),
  location: z.string().max(200).optional().nullable(),
  isPublished: z.coerce.boolean().default(false),
  peopleIds: z.array(z.string()).default([]),
});

export type EntryFormData = z.infer<typeof entryFormSchema>;
export type Category = (typeof CATEGORIES)[number];
export type DatePrecision = (typeof DATE_PRECISIONS)[number];
