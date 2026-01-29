"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDateString } from "@/lib/utils";
import { personFormSchema } from "@/lib/validations/person";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string };

// LINK USER TO EXISTING PERSON
export async function linkUserToPerson(personId: string): Promise<ActionResult> {
  const session = await auth();
  const tErrors = await getTranslations("errors");

  if (!session?.user?.id) {
    return { success: false, error: tErrors("unauthorized") };
  }

  const userId = session.user.id;

  try {
    // Check if this Person is already linked to another User
    const existingLink = await prisma.user.findFirst({
      where: { personId },
    });

    if (existingLink) {
      return { success: false, error: tErrors("people.alreadyLinked") };
    }

    // Check if the current user is already linked to a different Person
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { personId: true },
    });

    if (currentUser?.personId) {
      return { success: false, error: tErrors("people.youAreLinked") };
    }

    // Link the user to the person
    await prisma.user.update({
      where: { id: userId },
      data: { personId },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to link profile:", error);
    return { success: false, error: tErrors("people.linkFailed") };
  }
}

// CREATE NEW PERSON AND LINK TO USER
export async function createAndLinkPerson(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  const tErrors = await getTranslations("errors");
  const tValidation = await getTranslations("validation");

  if (!session?.user?.id) {
    return { success: false, error: tErrors("unauthorized") };
  }

  const userId = session.user.id;

  // Check if user is already linked
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { personId: true },
  });

  if (currentUser?.personId) {
    return { success: false, error: tErrors("people.youAreLinked") };
  }

  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    maidenName: formData.get("maidenName") || null,
    nickname: formData.get("nickname") || null,
    birthDate: formData.get("birthDate") || null,
    deathDate: null, // Users creating their own profile aren't deceased
    relationship: null, // Not needed for self
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

  const { birthDate, ...rest } = validatedFields.data;

  try {
    // Create person and link to user in a transaction
    await prisma.$transaction(async (tx) => {
      const person = await tx.person.create({
        data: {
          ...rest,
          birthDate: birthDate ? parseDateString(birthDate) : null,
          deathDate: null,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { personId: person.id },
      });
    });

    revalidatePath("/settings");
    revalidatePath("/people");
    return { success: true };
  } catch (error) {
    console.error("Failed to create and link profile:", error);
    return { success: false, error: tErrors("people.createFailed") };
  }
}

// UNLINK USER FROM PERSON
export async function unlinkProfile(): Promise<ActionResult> {
  const session = await auth();
  const tErrors = await getTranslations("errors");

  if (!session?.user?.id) {
    return { success: false, error: tErrors("unauthorized") };
  }

  const userId = session.user.id;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { personId: null },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to unlink profile:", error);
    return { success: false, error: tErrors("people.unlinkFailed") };
  }
}
