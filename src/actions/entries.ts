"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDateString } from "@/lib/utils";
import { entryFormSchema } from "@/lib/validations/entry";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string };

// CREATE ENTRY
export async function createEntry(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
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
    return { success: false, error: validatedFields.error.issues[0].message };
  }

  const {
    eventDate,
    eventDateEnd,
    isPublished,
    peopleIds: validatedPeopleIds,
    ...rest
  } = validatedFields.data;

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
    return { success: false, error: "Failed to create entry" };
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
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify ownership
  const existingEntry = await prisma.entry.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!existingEntry) {
    return { success: false, error: "Entry not found" };
  }

  if (existingEntry.authorId !== session.user.id) {
    return { success: false, error: "You can only edit your own entries" };
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
    return { success: false, error: validatedFields.error.issues[0].message };
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
    return { success: false, error: "Failed to update entry" };
  }

  revalidatePath(`/entries/${id}`);
  revalidatePath("/entries");
  revalidatePath("/people");
  redirect(`/entries/${id}`);
}

// DELETE ENTRY
export async function deleteEntry(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify ownership
  const existingEntry = await prisma.entry.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!existingEntry) {
    return { success: false, error: "Entry not found" };
  }

  if (existingEntry.authorId !== session.user.id) {
    return { success: false, error: "You can only delete your own entries" };
  }

  try {
    await prisma.entry.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return { success: false, error: "Failed to delete entry" };
  }

  revalidatePath("/entries");
  revalidatePath("/people");
  redirect("/entries");
}

// TOGGLE PUBLISH STATUS
export async function togglePublish(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify ownership and get current status
  const existingEntry = await prisma.entry.findUnique({
    where: { id },
    select: { authorId: true, publishedAt: true },
  });

  if (!existingEntry) {
    return { success: false, error: "Entry not found" };
  }

  if (existingEntry.authorId !== session.user.id) {
    return { success: false, error: "You can only publish your own entries" };
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
    return { success: false, error: "Failed to update publish status" };
  }
}
