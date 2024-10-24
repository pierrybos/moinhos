import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withRole } from "@/utils/authMiddleware";
import { getAllExtensions } from "@/utils/fileExtensions"; // ajuste o caminho conforme necessário

const prisma = new PrismaClient();

// Handler para obter todos os participantes (GET)
export async function GET() {
  try {
    // Busca todos os participantes e seus arquivos associados
    const participants = await prisma.participant.findMany({
      where: { isActive: true },
      include: {
        files: true,
      },
    });

    const response = NextResponse.json({ participants });

    // Adiciona cabeçalhos para evitar o cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;
  } catch (error) {
    console.error("Erro ao buscar os participantes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar os participantes." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Handler para criar um novo participante (POST)
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const allowedExtensions = getAllExtensions();

    const {
      participantName,
      churchGroupState,
      participationDate,
      programPart,
      phone,
      isWhatsApp,
      observations,
      files,
      imageRightsGranted,
      isMember,
      performanceType,
      microphoneCount,
      userPhoto,
      bibleVersion,
    } = data;

    // Salvar o participante no banco de dados com status "Pendente"
    const participant = await prisma.participant.create({
      data: {
        name: participantName,
        group: churchGroupState,
        participationDate: new Date(participationDate),
        programPart,
        phone,
        isWhatsApp,
        observations,
        status: "Pendente",
        isMember,
        imageRightsGranted: imageRightsGranted || isMember,
        performanceType,
        microphoneCount,
        userPhoto,
        bibleVersion,
      },
    });

    // Salvar os metadados dos arquivos associados ao participante
    for (const file of files) {
      const fileExtension = file.name
        .slice(file.name.lastIndexOf("."))
        .toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return NextResponse.json(
          { error: `Arquivo com extensão ${fileExtension} não é permitido.` },
          { status: 400 }
        );
      }
      await prisma.file.create({
        data: {
          filename: file.name,
          driveLink: file.link,
          participantId: participant.id,
        },
      });
    }

    return NextResponse.json({ message: "Dados salvos com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar os dados:", error);
    return NextResponse.json(
      { error: "Erro ao salvar os dados." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Handler para atualizar ou excluir um participante (PATCH / DELETE)
export async function PATCH(req: Request) {
  const authError = await withRole(req, "admin");
  if (authError) return authError;

  try {
    const { id, ...data } = await req.json();
    const participantId = parseInt(id, 10);

    if (isNaN(participantId)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    // Atualiza os dados do participante
    const updatedParticipant = await prisma.participant.update({
      where: { id: participantId },
      data,
    });

    return NextResponse.json({
      message: "Participante atualizado com sucesso.",
      participant: updatedParticipant,
    });
  } catch (error) {
    console.error("Erro ao atualizar o participante:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar o participante." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: Request) {
  const authError = await withRole(req, "admin");
  if (authError) return authError;

  try {
    const { id } = await req.json();
    const participantId = parseInt(id, 10);

    if (isNaN(participantId)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    // Atualiza o campo `isActive` para `false`, desativando o participante
    const updatedParticipant = await prisma.participant.update({
      where: { id: participantId },
      data: { isActive: false },
    });

    return NextResponse.json({
      message: "Participante desativado com sucesso.",
      participant: updatedParticipant,
    });
  } catch (error) {
    console.error("Erro ao desativar o participante:", error);
    return NextResponse.json(
      { error: "Erro ao desativar o participante." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
