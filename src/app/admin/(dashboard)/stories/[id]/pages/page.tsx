import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PagesList } from "./pages-list";
import { AddPageForm } from "./add-page-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StoryPagesPage({ params }: Props) {
  const { id } = await params;

  const story = await prisma.story.findUnique({
    where: { id },
    include: {
      pages: {
        orderBy: { pageNumber: "asc" },
      },
    },
  });

  if (!story) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/stories">
          <Button variant="ghost" size="sm">
            ← Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Páginas: {story.title}</h1>
          <p className="text-muted-foreground">
            {story.pages.length} páginas configuradas
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Páginas de la Historia</CardTitle>
            </CardHeader>
            <CardContent>
              <PagesList storyId={story.id} pages={story.pages} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Agregar Página</CardTitle>
            </CardHeader>
            <CardContent>
              <AddPageForm
                storyId={story.id}
                nextPageNumber={story.pages.length + 1}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
