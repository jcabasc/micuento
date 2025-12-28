import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { StoryEditForm } from "./story-edit-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditStoryPage({ params }: Props) {
  const { id } = await params;

  const story = await prisma.story.findUnique({
    where: { id },
  });

  if (!story) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/stories">
          <Button variant="ghost" size="sm">
            ← Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Editar Historia</h1>
      </div>

      <StoryEditForm story={story} />
    </div>
  );
}
