import Link from "next/link";
import Image from "next/image";
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
              <div className="flex gap-4">
                {/* Cover Image */}
                <div className="relative w-32 h-48 flex-shrink-0 rounded-l-lg overflow-hidden bg-muted">
                  {story.coverImage ? (
                    <Image
                      src={story.coverImage}
                      alt={story.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <div className="text-center p-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 mx-auto text-muted-foreground mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-xs text-muted-foreground">Sin imagen</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 py-4 pr-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{story.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {story.description}
                      </p>
                    </div>
                    <StoryStatusBadge status={story.status} />
                  </div>

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
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
