import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PersonalizationWizard } from "./personalization-wizard";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PersonalizePage({ params }: Props) {
  const { slug } = await params;

  const story = await prisma.story.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      price: true,
      pageCount: true,
    },
  });

  if (!story) {
    notFound();
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Link
          href={`/stories/${story.slug}`}
          className="text-muted-foreground hover:text-foreground mb-6 inline-block"
        >
          ← Volver a la historia
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Personaliza Tu Cuento</h1>
          <p className="text-muted-foreground">{story.title}</p>
        </div>

        <PersonalizationWizard story={story} />
      </div>
    </div>
  );
}
