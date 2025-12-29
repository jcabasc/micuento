import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const stories = await prisma.story.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Nuestras Historias</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elige la aventura perfecta para tu pequeño héroe. Cada historia se
            personaliza con su nombre y rostro.
          </p>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Próximamente tendremos historias disponibles.
            </p>
            <Link href="/">
              <Button variant="outline">Volver al Inicio</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface StoryCardProps {
  story: {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    pageCount: number;
    price: number;
  };
}

function StoryCard({ story }: StoryCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[3/4] relative bg-muted">
        {story.coverImage && story.coverImage !== "/placeholder-cover.jpg" ? (
          <Image
            src={story.coverImage}
            alt={story.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">📖</span>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {story.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary">
              {formatPrice(story.price)}
            </p>
            <p className="text-xs text-muted-foreground">
              {story.pageCount} páginas
            </p>
          </div>
          <Link href={`/stories/${story.slug}`}>
            <Button>Personalizar</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
