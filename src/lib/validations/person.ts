import { z } from "zod";

export const personFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  maidenName: z.string().max(100).optional().nullable(),
  nickname: z.string().max(100).optional().nullable(),
  birthDate: z.string().optional().nullable(),
  deathDate: z.string().optional().nullable(),
  relationship: z.string().max(100).optional().nullable(),
  bio: z.string().max(5000).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const relationshipSchema = z.object({
  fromPersonId: z.string().min(1),
  toPersonId: z.string().min(1),
  relationType: z.enum(["PARENT", "CHILD", "SPOUSE", "SIBLING"]),
});

export type PersonFormData = z.infer<typeof personFormSchema>;
export type RelationshipFormData = z.infer<typeof relationshipSchema>;
