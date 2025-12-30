import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create sample stories
  const adventureStory = await prisma.story.upsert({
    where: { slug: "la-gran-aventura" },
    update: {},
    create: {
      title: "La Gran Aventura",
      slug: "la-gran-aventura",
      description:
        "Una emocionante aventura donde tu hijo se convierte en el héroe que salva el reino mágico.",
      coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop",
      pageCount: 12,
      price: 8900000, // $89,000 COP in cents
      status: "PUBLISHED",
      pages: {
        create: [
          {
            pageNumber: 1,
            imageTemplate: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=800&fit=crop",
            textTemplate:
              "Había una vez un niño muy valiente llamado {child_name}.",
          },
          {
            pageNumber: 2,
            imageTemplate: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop",
            textTemplate:
              "{child_name} descubrió un mapa misterioso en el jardín.",
          },
          {
            pageNumber: 3,
            imageTemplate: "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=800&fit=crop",
            textTemplate:
              "El mapa llevaba a {child_name} a un bosque encantado.",
          },
        ],
      },
    },
  });

  const spaceStory = await prisma.story.upsert({
    where: { slug: "viaje-al-espacio" },
    update: {},
    create: {
      title: "Viaje al Espacio",
      slug: "viaje-al-espacio",
      description:
        "Tu pequeño astronauta explora las estrellas y descubre planetas increíbles.",
      coverImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&h=600&fit=crop",
      pageCount: 10,
      price: 8900000, // $89,000 COP in cents
      status: "PUBLISHED",
      pages: {
        create: [
          {
            pageNumber: 1,
            imageTemplate: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&h=800&fit=crop",
            textTemplate:
              "{child_name} siempre soñaba con viajar a las estrellas.",
          },
          {
            pageNumber: 2,
            imageTemplate: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1200&h=800&fit=crop",
            textTemplate:
              "Un día, {child_name} encontró un cohete en el patio trasero.",
          },
          {
            pageNumber: 3,
            imageTemplate: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&h=800&fit=crop",
            textTemplate:
              "{child_name} despegó hacia el espacio con una gran sonrisa.",
          },
        ],
      },
    },
  });

  const oceanStory = await prisma.story.upsert({
    where: { slug: "el-oceano-magico" },
    update: {},
    create: {
      title: "El Océano Mágico",
      slug: "el-oceano-magico",
      description:
        "Sumérgete en una aventura submarina donde tu hijo conoce criaturas marinas fantásticas.",
      coverImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
      pageCount: 10,
      price: 8900000, // $89,000 COP in cents
      status: "PUBLISHED",
      pages: {
        create: [
          {
            pageNumber: 1,
            imageTemplate: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop",
            textTemplate:
              "{child_name} caminaba por la playa cuando vio algo brillante.",
          },
          {
            pageNumber: 2,
            imageTemplate: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1200&h=800&fit=crop",
            textTemplate:
              "Era una concha mágica que le permitió a {child_name} respirar bajo el agua.",
          },
          {
            pageNumber: 3,
            imageTemplate: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop",
            textTemplate:
              "{child_name} nadó junto a delfines y tortugas marinas.",
          },
        ],
      },
    },
  });

  console.log("Created stories:", {
    adventureStory: adventureStory.title,
    spaceStory: spaceStory.title,
    oceanStory: oceanStory.title,
  });

  console.log("Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
