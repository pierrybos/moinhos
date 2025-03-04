// app/api/saveParticipant/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { getAllExtensions } from "../../../utils/fileExtensions";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const {
      participantName,
      churchGroupState,
      participationDate,
      programPart,
      phone,
      isWhatsApp,
      observations,
      files,
      isMember,
      imageRightsGranted,
      performanceType,
      microphoneCount,
      userPhoto,
      bibleVersion,
      institutionSlug,
    } = data;

    if (
      !participantName ||
      !churchGroupState ||
      !participationDate ||
      !programPart ||
      !institutionSlug
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const institution = await prisma.institution.findFirst({
      where: {
        slug: institutionSlug,
        users: {
          some: {
            email: session.user.email,
          },
        },
      },
    });

    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

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
        institution: {
          connect: {
            id: institution.id,
          },
        },
      },
    });

    // Salvar os arquivos
    const allowedExtensions = getAllExtensions();
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
          driveLink: "",
          participantId: participant.id,
          institutionId: institution.id,
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
    // Encerra a conexão para evitar retenção de cache de conexão
    await prisma.$disconnect();
  }
}
