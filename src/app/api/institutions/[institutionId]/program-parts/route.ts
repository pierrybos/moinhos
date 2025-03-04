import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { institutionId: string } }
) {
  try {
    const institution = await prisma.institution.findUnique({
      where: { slug: params.institutionId },
    });

    if (!institution) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      );
    }

    // Por enquanto retornando uma lista estática, mas você pode personalizar de acordo com a instituição
    const programParts = [
      'Sermão',
      'Louvor',
      'Testemunho',
      'Apresentação Musical',
      'Leitura Bíblica',
      'Oração',
      'Outro'
    ];

    return NextResponse.json(programParts);
  } catch (error) {
    console.error('Error fetching program parts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
