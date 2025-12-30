"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleStoryStatus(storyId: string): Promise<void> {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { status: true },
  });

  if (!story) {
    throw new Error("Story not found");
  }

  await prisma.story.update({
    where: { id: storyId },
    data: {
      status: story.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
    },
  });

  revalidatePath("/admin/stories");
}

export async function deleteStory(storyId: string): Promise<void> {
  await prisma.story.delete({
    where: { id: storyId },
  });

  revalidatePath("/admin/stories");
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createStory(formData: FormData): Promise<{ id: string }> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string, 10) * 100; // Convert to cents
  const coverImage = (formData.get("coverImage") as string) || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop";

  const slug = generateSlug(title);

  const story = await prisma.story.create({
    data: {
      title,
      slug,
      description,
      price,
      coverImage,
      pageCount: 0,
      status: "DRAFT",
    },
  });

  revalidatePath("/admin/stories");
  return { id: story.id };
}

export async function updateStory(
  storyId: string,
  formData: FormData
): Promise<void> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string, 10) * 100;
  const coverImage = formData.get("coverImage") as string;

  const slug = generateSlug(title);

  await prisma.story.update({
    where: { id: storyId },
    data: {
      title,
      slug,
      description,
      price,
      coverImage,
    },
  });

  revalidatePath("/admin/stories");
  revalidatePath(`/admin/stories/${storyId}`);
}
