import { PrismaClient, UserRole, WorkMode } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const publisher = await prisma.user.upsert({
    where: { email: "talento@matchops.dev" },
    update: {},
    create: {
      email: "talento@matchops.dev",
      name: "MatchOps Talent Lab",
      role: UserRole.PUBLISHER,
      reputationPoints: 76
    }
  });

  const opportunities = [
    {
      title: "Frontend Developer React",
      description:
        "Construye interfaces de alto rendimiento para una plataforma SaaS de matching inteligente. Se requiere experiencia con React, TypeScript y consumo de APIs REST.",
      tags: ["React", "TypeScript", "SaaS", "UI"],
      workMode: WorkMode.REMOTE,
      location: "Latam",
      contractType: "Freelance",
      compensation: "USD 1,800 - 2,600"
    },
    {
      title: "Diseñador UX/UI Mobile",
      description:
        "Diseña flujos mobile-first para Android e iOS, con foco en onboarding sin fricción, feed de oportunidades y acciones por gestos.",
      tags: ["UX", "UI", "Mobile", "Figma"],
      workMode: WorkMode.HYBRID,
      location: "Lima, Perú",
      contractType: "Proyecto",
      compensation: "S/ 4,000 - 6,000"
    },
    {
      title: "Backend Engineer Node.js",
      description:
        "Implementa servicios de autenticación, matching, mensajería y eventos de interacción usando Node.js, PostgreSQL y arquitectura API-first.",
      tags: ["Node.js", "PostgreSQL", "API", "Matching"],
      workMode: WorkMode.REMOTE,
      location: "Global",
      contractType: "Tiempo completo",
      compensation: "USD 3,000 - 4,500"
    }
  ];

  for (const opportunity of opportunities) {
    await prisma.opportunity.create({
      data: {
        ...opportunity,
        publisherId: publisher.id
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
