import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params;

  const story = await prisma.story.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      pages: {
        orderBy: { pageNumber: "asc" },
        take: 3, // Show first 3 pages as preview
      },
    },
  });

  if (!story) {
    notFound();
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Back link */}
        <Link
          href="/stories"
          className="text-muted-foreground hover:text-foreground mb-8 inline-block"
        >
          ← Volver a historias
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Cover Image */}
          <div className="aspect-[3/4] relative bg-muted rounded-xl overflow-hidden">
            {story.coverImage && story.coverImage !== "/placeholder-cover.jpg" ? (
              <Image
                src={story.coverImage}
                alt={story.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl">📖</span>
              </div>
            )}
          </div>

          {/* Story Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
              <p className="text-xl text-muted-foreground">
                {story.description}
              </p>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(story.price)}
              </span>
              <span className="text-muted-foreground">
                {story.pageCount} páginas
              </span>
            </div>

            {/* Features */}
            <div className="space-y-3 py-4 border-y">
              <Feature icon="✨" text="Personalizado con el nombre de tu hijo" />
              <Feature icon="📸" text="Su rostro aparece en cada página" />
              <Feature icon="📱" text="Descarga digital inmediata" />
              <Feature icon="🖨️" text="Opción de impresión disponible" />
            </div>

            {/* CTA */}
            <Link href={`/stories/${story.slug}/personalize`}>
              <Button size="lg" className="w-full text-lg">
                Personalizar Este Cuento
              </Button>
            </Link>

            <p className="text-sm text-muted-foreground text-center">
              Solo toma 2 minutos crear tu libro personalizado
            </p>
          </div>
        </div>

        {/* Preview Section */}
        {story.pages.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Vista Previa de las Páginas
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {story.pages.map((page) => (
                <Card key={page.id} className="overflow-hidden">
                  <div className="aspect-square relative bg-muted">
                    {page.imageTemplate ? (
                      <Image
                        src={page.imageTemplate}
                        alt={`Página ${page.pageNumber}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl">📄</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Página {page.pageNumber}
                    </p>
                    <p className="text-sm mt-1 line-clamp-2">
                      {page.textTemplate.replace("{child_name}", "[Nombre]")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
