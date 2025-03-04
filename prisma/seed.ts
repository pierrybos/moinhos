const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Criar instituição padrão
  const defaultInstitution = await prisma.institution.create({
    data: {
      name: 'Igreja Exemplo',
      slug: 'igreja-exemplo',
      driveConfig: {
        clientId: '',
        clientSecret: '',
        redirectUri: '',
        refreshToken: '',
        folderId: '',
      },
      isActive: true,
    },
  });

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@exemplo.com',
      password: hashedPassword,
      role: 'admin',
      isApproved: true,
      institutionId: defaultInstitution.id,
    },
  });

  // Criar algumas partes do programa padrão
  const programParts = ['Louvor', 'Pregação', 'Apresentação', 'Música Especial'];
  for (const part of programParts) {
    await prisma.programPart.create({
      data: {
        name: part,
        isActive: true,
        institutionId: defaultInstitution.id,
      },
    });
  }

  console.log('Dados iniciais criados com sucesso!');
  console.log('Email admin: admin@exemplo.com');
  console.log('Senha admin: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
