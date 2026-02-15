"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDateString } from "@/lib/utils";
import {
  personFormSchema,
  relationshipSchema,
} from "@/lib/validations/person";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string };

// Helper function to get inverse relationship type
function getInverseRelationType(type: string): string {
  const inverseMap: Record<string, string> = {
    PARENT: "CHILD",
    CHILD: "PARENT",
    SPOUSE: "SPOUSE",
    SIBLING: "SIBLING",
  };
  return inverseMap[type] || type;
}

// CREATE PERSON
export async function createPerson(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  const tErrors = await getTranslations("errors");
  const tValidation = await getTranslations("validation");

  if (!session) {
    return { success: false, error: tErrors("unauthorized") };
  }

  // Block viewers from creating people
  if (session.user.role === "VIEWER") {
    return {
      success: false,
      error: tErrors("common.viewerReadOnly"),
    };
  }

  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    maidenName: formData.get("maidenName") || null,
    nickname: formData.get("nickname") || null,
    birthDate: formData.get("birthDate") || null,
    deathDate: formData.get("deathDate") || null,
    relationship: formData.get("relationship") || null,
    bio: formData.get("bio") || null,
  };

  const validatedFields = personFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    // Map Zod field errors to translated messages
    const firstError = validatedFields.error.issues[0];
    const fieldName = firstError.path[0] as string;
    return {
      success: false,
      error: tValidation("required", { field: fieldName }),
    };
  }

  const { birthDate, deathDate, ...rest } = validatedFields.data;

  let personId: string;

  try {
    const person = await prisma.person.create({
      data: {
        ...rest,
        birthDate: birthDate ? parseDateString(birthDate) : null,
        deathDate: deathDate ? parseDateString(deathDate) : null,
      },
    });
    personId = person.id;
  } catch (error) {
    console.error("Failed to create person:", error);
    return { success: false, error: tErrors("people.createFailed") };
  }

  // redirect() must be outside try-catch because it throws NEXT_REDIRECT internally
  revalidatePath("/people");
  redirect(`/people/${personId}`);
}

// UPDATE PERSON
export async function updatePerson(
  id: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  const tErrors = await getTranslations("errors");
  const tValidation = await getTranslations("validation");

  if (!session) {
    return { success: false, error: tErrors("unauthorized") };
  }

  // Block viewers from editing people
  if (session.user.role === "VIEWER") {
    return {
      success: false,
      error: tErrors("common.viewerReadOnly"),
    };
  }

  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    maidenName: formData.get("maidenName") || null,
    nickname: formData.get("nickname") || null,
    birthDate: formData.get("birthDate") || null,
    deathDate: formData.get("deathDate") || null,
    relationship: formData.get("relationship") || null,
    bio: formData.get("bio") || null,
  };

  const validatedFields = personFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const firstError = validatedFields.error.issues[0];
    const fieldName = firstError.path[0] as string;
    return {
      success: false,
      error: tValidation("required", { field: fieldName }),
    };
  }

  const { birthDate, deathDate, ...rest } = validatedFields.data;

  try {
    await prisma.person.update({
      where: { id },
      data: {
        ...rest,
        birthDate: birthDate ? parseDateString(birthDate) : null,
        deathDate: deathDate ? parseDateString(deathDate) : null,
      },
    });
  } catch (error) {
    console.error("Failed to update person:", error);
    return { success: false, error: tErrors("people.updateFailed") };
  }

  revalidatePath(`/people/${id}`);
  revalidatePath("/people");
  redirect(`/people/${id}`);
}

// DELETE PERSON
export async function deletePerson(id: string): Promise<ActionResult> {
  const session = await auth();
  const tErrors = await getTranslations("errors");

  if (!session) {
    return { success: false, error: tErrors("unauthorized") };
  }

  // Block viewers from deleting people
  if (session.user.role === "VIEWER") {
    return {
      success: false,
      error: tErrors("common.viewerReadOnly"),
    };
  }

  try {
    await prisma.person.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to delete person:", error);
    return { success: false, error: tErrors("people.deleteFailed") };
  }

  revalidatePath("/people");
  redirect("/people");
}

// ADD RELATIONSHIP
export async function addRelationship(data: {
  fromPersonId: string;
  toPersonId: string;
  relationType: string;
}): Promise<ActionResult> {
  const session = await auth();
  const tErrors = await getTranslations("errors");

  if (!session) {
    return { success: false, error: tErrors("unauthorized") };
  }

  // Block viewers from adding relationships
  if (session.user.role === "VIEWER") {
    return {
      success: false,
      error: tErrors("common.viewerReadOnly"),
    };
  }

  const validatedFields = relationshipSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, error: tErrors("generic") };
  }

  const { fromPersonId, toPersonId, relationType } = validatedFields.data;

  // Prevent self-relationships
  if (fromPersonId === toPersonId) {
    return { success: false, error: tErrors("people.selfRelationship") };
  }

  // Get the inverse relationship type
  const inverseType = getInverseRelationType(relationType);

  try {
    // Create bidirectional relationship in a transaction
    await prisma.$transaction([
      prisma.familyRelation.create({
        data: { fromPersonId, toPersonId, relationType },
      }),
      prisma.familyRelation.create({
        data: {
          fromPersonId: toPersonId,
          toPersonId: fromPersonId,
          relationType: inverseType,
        },
      }),
    ]);

    revalidatePath(`/people/${fromPersonId}`);
    revalidatePath(`/people/${toPersonId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to add relationship:", error);
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: tErrors("people.relationshipExists") };
    }
    return { success: false, error: tErrors("people.addRelationshipFailed") };
  }
}

// REMOVE RELATIONSHIP
export async function removeRelationship(
  fromPersonId: string,
  toPersonId: string,
  relationType: string
): Promise<ActionResult> {
  const session = await auth();
  const tErrors = await getTranslations("errors");

  if (!session) {
    return { success: false, error: tErrors("unauthorized") };
  }

  // Block viewers from removing relationships
  if (session.user.role === "VIEWER") {
    return {
      success: false,
      error: tErrors("common.viewerReadOnly"),
    };
  }

  const inverseType = getInverseRelationType(relationType);

  try {
    // Delete both directions of the relationship
    await prisma.$transaction([
      prisma.familyRelation.delete({
        where: {
          fromPersonId_toPersonId_relationType: {
            fromPersonId,
            toPersonId,
            relationType,
          },
        },
      }),
      prisma.familyRelation.delete({
        where: {
          fromPersonId_toPersonId_relationType: {
            fromPersonId: toPersonId,
            toPersonId: fromPersonId,
            relationType: inverseType,
          },
        },
      }),
    ]);

    revalidatePath(`/people/${fromPersonId}`);
    revalidatePath(`/people/${toPersonId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to remove relationship:", error);
    return { success: false, error: tErrors("people.removeRelationshipFailed") };
  }
}
