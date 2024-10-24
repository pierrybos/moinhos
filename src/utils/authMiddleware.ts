// src/utils/authMiddleware.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Ajuste o caminho conforme seu setup
import { checkRole } from "./authUtils";

export const withRole = async (req: Request, role: string) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  if (!checkRole(session.user, role)) {
    return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
  }

  return null; // Retorna null se o usuário tiver a role necessária
};
