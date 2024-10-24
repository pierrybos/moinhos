// app/api/users/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withRole } from "@/utils/authMiddleware";

const prisma = new PrismaClient();

// Handler para obter todos os usuários
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Handler para atualizar o role de um usuário
export async function PATCH(req: Request) {
  const authError = await withRole(req, "admin");
  if (authError) return authError; // Verifica se é admin

  try {
    const { id, role } = await req.json();
    
    // Atualiza o role do usuário
    await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json({ message: "Permissão atualizada com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar a permissão do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar a permissão." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
