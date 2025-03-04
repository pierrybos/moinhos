// app/api/rooms/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const rooms = await prisma.room.findMany({
      where: {
        institution: {
          users: {
            some: {
              email: session.user.email,
            },
          },
        },
      },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { name, capacity, institutionSlug } = data;

    if (!name || !capacity || !institutionSlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const institution = await prisma.institution.findFirst({
      where: {
        slug: institutionSlug,
        users: {
          some: {
            email: session.user.email,
            role: 'admin',
          },
        },
      },
    });

    if (!institution) {
      return NextResponse.json(
        { error: 'Institution not found or user is not admin' },
        { status: 404 }
      );
    }

    const room = await prisma.room.create({
      data: {
        name,
        capacity: parseInt(capacity),
        institution: {
          connect: {
            id: institution.id,
          },
        },
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { id, name, capacity, institutionSlug } = data;

    if (!id || !name || !capacity || !institutionSlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const institution = await prisma.institution.findFirst({
      where: {
        slug: institutionSlug,
        users: {
          some: {
            email: session.user.email,
            role: 'admin',
          },
        },
      },
    });

    if (!institution) {
      return NextResponse.json(
        { error: 'Institution not found or user is not admin' },
        { status: 404 }
      );
    }

    const room = await prisma.room.update({
      where: { id },
      data: {
        name,
        capacity: parseInt(capacity),
        institution: {
          connect: {
            id: institution.id,
          },
        },
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { id, institutionSlug } = data;

    if (!id || !institutionSlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const institution = await prisma.institution.findFirst({
      where: {
        slug: institutionSlug,
        users: {
          some: {
            email: session.user.email,
            role: 'admin',
          },
        },
      },
    });

    if (!institution) {
      return NextResponse.json(
        { error: 'Institution not found or user is not admin' },
        { status: 404 }
      );
    }

    await prisma.room.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Room deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
