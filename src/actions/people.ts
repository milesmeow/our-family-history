"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  personFormSchema,
  relationshipSchema,
} from "@/lib/validations/person";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  if (!session) {
    return { success: false, error: "Unauthorized" };
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
    return { success: false, error: validatedFields.error.issues[0].message };
  }

  const { birthDate, deathDate, ...rest } = validatedFields.data;

  let personId: string;

  try {
    const person = await prisma.person.create({
      data: {
        ...rest,
        birthDate: birthDate ? new Date(birthDate) : null,
        deathDate: deathDate ? new Date(deathDate) : null,
      },
    });
    personId = person.id;
  } catch (error) {
    console.error("Failed to create person:", error);
    return { success: false, error: "Failed to create person" };
  }

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
  if (!session) {
    return { success: false, error: "Unauthorized" };
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
    return { success: false, error: validatedFields.error.issues[0].message };
  }

  const { birthDate, deathDate, ...rest } = validatedFields.data;

  try {
    await prisma.person.update({
      where: { id },
      data: {
        ...rest,
        birthDate: birthDate ? new Date(birthDate) : null,
        deathDate: deathDate ? new Date(deathDate) : null,
      },
    });
  } catch (error) {
    console.error("Failed to update person:", error);
    return { success: false, error: "Failed to update person" };
  }

  revalidatePath(`/people/${id}`);
  revalidatePath("/people");
  redirect(`/people/${id}`);
}

// DELETE PERSON
export async function deletePerson(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.person.delete({
      where: { id },
    });

    revalidatePath("/people");
    redirect("/people");
  } catch (error) {
    console.error("Failed to delete person:", error);
    return { success: false, error: "Failed to delete person" };
  }
}

// ADD RELATIONSHIP
export async function addRelationship(data: {
  fromPersonId: string;
  toPersonId: string;
  relationType: string;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const validatedFields = relationshipSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.issues[0].message };
  }

  const { fromPersonId, toPersonId, relationType } = validatedFields.data;

  // Prevent self-relationships
  if (fromPersonId === toPersonId) {
    return { success: false, error: "Cannot create relationship with self" };
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
      return { success: false, error: "This relationship already exists" };
    }
    return { success: false, error: "Failed to add relationship" };
  }
}

// REMOVE RELATIONSHIP
export async function removeRelationship(
  fromPersonId: string,
  toPersonId: string,
  relationType: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Unauthorized" };
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
    return { success: false, error: "Failed to remove relationship" };
  }
}
