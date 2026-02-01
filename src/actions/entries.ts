"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDateString } from "@/lib/utils";
import { entryFormSchema } from "@/lib/validations/entry";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string };

// CREATE ENTRY
export async function createEntry(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  const tErrors = await getTranslations("errors");
  const tValidation = await getTranslations("validation");

  if (!session?.user?.id) {
    return { success: false, error: tErrors("unauthorized") };
  }

  // Check role permissions - VIEWERs can only browse, not create
  if (session.user.role === "VIEWER") {
    return {
      success: false,
      error: "Viewers have read-only access. Contact an admin to upgrade your account.",
    };
  }

  // Verify user exists in database (JWT sessions don't auto-check this)
  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, personId: true },
  });

  if (!userExists) {
    return {
      success: false,
      error: "Your account no longer exists. Please contact an administrator.",
    };
  }

  // Check if user's personId references a deleted person
  if (userExists.personId) {
    const linkedPerson = await prisma.person.findUnique({
      where: { id: userExists.personId },
      select: { id: true },
    });

    if (!linkedPerson) {
      return {
        success: false,
        error: `Your account is linked to a deleted person profile (ID: ${userExists.personId}). Please ask an admin to unlink your profile in Settings.`,
      };
    }
  }

  // Parse peopleIds from form data (multiple values with same name)
  const peopleIds = formData.getAll("peopleIds").map((id) => String(id));

  const rawData = {
    title: formData.get("title"),
    content: formData.get("content"),
    summary: formData.get("summary") || null,
    eventDate: formData.get("eventDate") || null,
    eventDateEnd: formData.get("eventDateEnd") || null,
    dateApproximate: formData.get("dateApproximate") === "on",
    datePrecision: formData.get("datePrecision") || "DAY",
    era: formData.get("era") || null,
    category: formData.get("category") || "STORY",
    location: formData.get("location") || null,
    isPublished: formData.get("isPublished") === "on",
    peopleIds,
  };

  const validatedFields = entryFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const firstError = validatedFields.error.issues[0];
    const fieldName = firstError.path[0] as string;
    return {
      success: false,
      error: tValidation("required", { field: fieldName }),
    };
  }

  const {
    eventDate,
    eventDateEnd,
    isPublished,
    peopleIds: validatedPeopleIds,
    ...rest
  } = validatedFields.data;

  // Verify all selected people exist in database
  if (validatedPeopleIds.length > 0) {
    const existingPeople = await prisma.person.findMany({
      where: { id: { in: validatedPeopleIds } },
      select: { id: true },
    });

    if (existingPeople.length !== validatedPeopleIds.length) {
      const existingIds = new Set(existingPeople.map((p) => p.id));
      const missingIds = validatedPeopleIds.filter((id) => !existingIds.has(id));
      return {
        success: false,
        error: `Some selected people no longer exist (IDs: ${missingIds.join(", ")}). Please refresh and try again.`,
      };
    }
  }

  let entryId: string;

  try {
    const entry = await prisma.entry.create({
      data: {
        ...rest,
        eventDate: eventDate ? parseDateString(eventDate) : null,
        eventDateEnd: eventDateEnd ? parseDateString(eventDateEnd) : null,
        publishedAt: isPublished ? new Date() : null,
        authorId: session.user.id,
        // Create PersonOnEntry records for linked people
        peopleInvolved: {
          create: validatedPeopleIds.map((personId) => ({
            personId,
          })),
        },
      },
    });
    entryId = entry.id;
  } catch (error) {
    console.error("Failed to create entry:", error);

    // In development, show more detailed error messages
    if (process.env.NODE_ENV === "development") {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: `Database error: ${errorMessage}` };
    }

    return { success: false, error: tErrors("entries.createFailed") };
  }

  // redirect() must be outside try-catch because it throws NEXT_REDIRECT internally
  revalidatePath("/entries");
  revalidatePath("/people"); // Entries may appear on people profiles
  redirect(`/entries/${entryId}`);
}

// UPDATE ENTRY
export async function updateEntry(
  id: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  const tErrors = await getTranslations("errors");
  const tValidation = await getTranslations("validation");

  if (!session?.user?.id) {
    return { success: false, error: tErrors("unauthorized") };
  }

  // Check role permissions - VIEWERs can only browse, not edit
  if (session.user.role === "VIEWER") {
    return {
      success: false,
      error: "Viewers have read-only access. Contact an admin to upgrade your account.",
    };
  }

  // Verify ownership
  const existingEntry = await prisma.entry.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!existingEntry) {
    return { success: false, error: tErrors("notFound") };
  }

  if (existingEntry.authorId !== session.user.id) {
    return { success: false, error: tErrors("entries.notOwner") };
  }

  // Parse peopleIds from form data
  const peopleIds = formData.getAll("peopleIds").map((id) => String(id));

  const rawData = {
    title: formData.get("title"),
    content: formData.get("content"),
    summary: formData.get("summary") || null,
    eventDate: formData.get("eventDate") || null,
    eventDateEnd: formData.get("eventDateEnd") || null,
    dateApproximate: formData.get("dateApproximate") === "on",
    datePrecision: formData.get("datePrecision") || "DAY",
    era: formData.get("era") || null,
    category: formData.get("category") || "STORY",
    location: formData.get("location") || null,
    isPublished: formData.get("isPublished") === "on",
    peopleIds,
  };

  const validatedFields = entryFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const firstError = validatedFields.error.issues[0];
    const fieldName = firstError.path[0] as string;
    return {
      success: false,
      error: tValidation("required", { field: fieldName }),
    };
  }

  const {
    eventDate,
    eventDateEnd,
    isPublished,
    peopleIds: validatedPeopleIds,
    ...rest
  } = validatedFields.data;

  try {
    // Use transaction to update entry and replace people links
    await prisma.$transaction(async (tx) => {
      // Delete existing PersonOnEntry records
      await tx.personOnEntry.deleteMany({
        where: { entryId: id },
      });

      // Update entry and create new PersonOnEntry records
      await tx.entry.update({
        where: { id },
        data: {
          ...rest,
          eventDate: eventDate ? parseDateString(eventDate) : null,
          eventDateEnd: eventDateEnd ? parseDateString(eventDateEnd) : null,
          publishedAt: isPublished ? new Date() : null,
          peopleInvolved: {
            create: validatedPeopleIds.map((personId) => ({
              personId,
            })),
          },
        },
      });
    });
  } catch (error) {
    console.error("Failed to update entry:", error);

    // In development, show more detailed error messages
    if (process.env.NODE_ENV === "development") {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: `Database error: ${errorMessage}` };
    }

    return { success: false, error: tErrors("entries.updateFailed") };
  }

  revalidatePath(`/entries/${id}`);
  revalidatePath("/entries");
  revalidatePath("/people");
  redirect(`/entries/${id}`);
}

// DELETE ENTRY
export async function deleteEntry(id: string): Promise<ActionResult> {
  const session = await auth();
  const tErrors = await getTranslations("errors");

  if (!session?.user?.id) {
    return { success: false, error: tErrors("unauthorized") };
  }

  // Check role permissions - VIEWERs can only browse, not delete
  if (session.user.role === "VIEWER") {
    return {
      success: false,
      error: "Viewers have read-only access. Contact an admin to upgrade your account.",
    };
  }

  // Verify ownership
  const existingEntry = await prisma.entry.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!existingEntry) {
    return { success: false, error: tErrors("notFound") };
  }

  if (existingEntry.authorId !== session.user.id) {
    return { success: false, error: tErrors("entries.notOwner") };
  }

  try {
    await prisma.entry.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return { success: false, error: tErrors("entries.deleteFailed") };
  }

  revalidatePath("/entries");
  revalidatePath("/people");
  redirect("/entries");
}

// TOGGLE PUBLISH STATUS
export async function togglePublish(id: string): Promise<ActionResult> {
  const session = await auth();
  const tErrors = await getTranslations("errors");

  if (!session?.user?.id) {
    return { success: false, error: tErrors("unauthorized") };
  }

  // Check role permissions - VIEWERs can only browse, not publish
  if (session.user.role === "VIEWER") {
    return {
      success: false,
      error: "Viewers have read-only access. Contact an admin to upgrade your account.",
    };
  }

  // Verify ownership and get current status
  const existingEntry = await prisma.entry.findUnique({
    where: { id },
    select: { authorId: true, publishedAt: true },
  });

  if (!existingEntry) {
    return { success: false, error: tErrors("notFound") };
  }

  if (existingEntry.authorId !== session.user.id) {
    return { success: false, error: tErrors("entries.notOwner") };
  }

  try {
    await prisma.entry.update({
      where: { id },
      data: {
        // Toggle: if published, unpublish; if draft, publish
        publishedAt: existingEntry.publishedAt ? null : new Date(),
      },
    });

    revalidatePath(`/entries/${id}`);
    revalidatePath("/entries");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle publish status:", error);
    return { success: false, error: tErrors("entries.updateFailed") };
  }
}
