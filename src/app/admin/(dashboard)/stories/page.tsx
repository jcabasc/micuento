import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { StoryStatusBadge } from "./story-status-badge";
import { ToggleStatusButton } from "./toggle-status-button";

export default async function StoriesPage() {
  const stories = await prisma.story.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { pages: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Historias</h1>
          <p className="text-muted-foreground">
            Gestiona las historias disponibles
          </p>
        </div>
        <Link href="/admin/stories/new">
          <Button>Nueva Historia</Button>
        </Link>
      </div>

      {stories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No hay historias creadas aún
            </p>
            <Link href="/admin/stories/new">
              <Button>Crear primera historia</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {stories.map((story) => (
            <Card key={story.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{story.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {story.description}
                    </p>
                  </div>
                  <StoryStatusBadge status={story.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{story._count.pages} páginas</span>
                    <span>{formatPrice(story.price)}</span>
                    <span>/{story.slug}</span>
                  </div>
                  <div className="flex gap-2">
                    <ToggleStatusButton
                      storyId={story.id}
                      currentStatus={story.status}
                    />
                    <Link href={`/admin/stories/${story.id}`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <Link href={`/admin/stories/${story.id}/pages`}>
                      <Button variant="outline" size="sm">
                        Páginas
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
