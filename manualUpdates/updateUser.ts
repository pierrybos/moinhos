import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateUsers() {
  // Atualizar os usuários que são admin
  await prisma.user.updateMany({
    where: {
      isAdmin: true,
    },
    data: {
      role: "admin",
    },
  });

  // Atualizar os usuários que não são admin
  await prisma.user.updateMany({
    where: {
      isAdmin: false,
    },
    data: {
      role: "default",
    },
  });

  console.log("Usuários atualizados com sucesso.");
}

updateUsers()
  .catch((e) => {
    console.error("Erro ao atualizar usuários:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
