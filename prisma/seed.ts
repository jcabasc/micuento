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
      coverImage: "/stories/adventure/cover.jpg",
      pageCount: 12,
      price: 8900000, // $89,000 COP in cents
      status: "PUBLISHED",
      pages: {
        create: [
          {
            pageNumber: 1,
            imageTemplate: "/stories/adventure/page1.jpg",
            textTemplate:
              "Había una vez un niño muy valiente llamado {child_name}.",
          },
          {
            pageNumber: 2,
            imageTemplate: "/stories/adventure/page2.jpg",
            textTemplate:
              "{child_name} descubrió un mapa misterioso en el jardín.",
          },
          {
            pageNumber: 3,
            imageTemplate: "/stories/adventure/page3.jpg",
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
      coverImage: "/stories/space/cover.jpg",
      pageCount: 10,
      price: 8900000, // $89,000 COP in cents
      status: "PUBLISHED",
      pages: {
        create: [
          {
            pageNumber: 1,
            imageTemplate: "/stories/space/page1.jpg",
            textTemplate:
              "{child_name} siempre soñaba con viajar a las estrellas.",
          },
          {
            pageNumber: 2,
            imageTemplate: "/stories/space/page2.jpg",
            textTemplate:
              "Un día, {child_name} encontró un cohete en el patio trasero.",
          },
          {
            pageNumber: 3,
            imageTemplate: "/stories/space/page3.jpg",
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
      coverImage: "/stories/ocean/cover.jpg",
      pageCount: 10,
      price: 8900000, // $89,000 COP in cents
      status: "PUBLISHED",
      pages: {
        create: [
          {
            pageNumber: 1,
            imageTemplate: "/stories/ocean/page1.jpg",
            textTemplate:
              "{child_name} caminaba por la playa cuando vio algo brillante.",
          },
          {
            pageNumber: 2,
            imageTemplate: "/stories/ocean/page2.jpg",
            textTemplate:
              "Era una concha mágica que le permitió a {child_name} respirar bajo el agua.",
          },
          {
            pageNumber: 3,
            imageTemplate: "/stories/ocean/page3.jpg",
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
