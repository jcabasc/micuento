"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

interface AddPageData {
  pageNumber: number;
  imageTemplate: string;
  textTemplate: string;
}

export async function addPage(storyId: string, data: AddPageData): Promise<void> {
  await prisma.storyPage.create({
    data: {
      storyId,
      pageNumber: data.pageNumber,
      imageTemplate: data.imageTemplate,
      textTemplate: data.textTemplate,
    },
  });

  // Update page count
  const pageCount = await prisma.storyPage.count({
    where: { storyId },
  });

  await prisma.story.update({
    where: { id: storyId },
    data: { pageCount },
  });

  revalidatePath(`/admin/stories/${storyId}/pages`);
}

interface UpdatePageData {
  imageTemplate: string;
  textTemplate: string;
}

export async function updatePage(pageId: string, data: UpdatePageData): Promise<void> {
  await prisma.storyPage.update({
    where: { id: pageId },
    data: {
      imageTemplate: data.imageTemplate,
      textTemplate: data.textTemplate,
    },
  });
}

export async function deletePage(pageId: string, storyId: string): Promise<void> {
  const page = await prisma.storyPage.findUnique({
    where: { id: pageId },
  });

  if (!page) return;

  await prisma.storyPage.delete({
    where: { id: pageId },
  });

  // Reorder remaining pages
  const remainingPages = await prisma.storyPage.findMany({
    where: { storyId },
    orderBy: { pageNumber: "asc" },
  });

  for (let i = 0; i < remainingPages.length; i++) {
    await prisma.storyPage.update({
      where: { id: remainingPages[i].id },
      data: { pageNumber: i + 1 },
    });
  }

  // Update page count
  await prisma.story.update({
    where: { id: storyId },
    data: { pageCount: remainingPages.length },
  });

  revalidatePath(`/admin/stories/${storyId}/pages`);
}
