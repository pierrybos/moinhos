import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

import InstitutionSettingsForm from './InstitutionSettingsForm';

export default async function SettingsPage({
  params,
}: {
  params: { institutionId: string };
}) {
  const session = await getServerSession();
  
  if (!session) {
    redirect(`/${params.institutionId}/login`);
  }

  const institution = await prisma.institution.findUnique({
    where: { slug: params.institutionId },
  });

  if (!institution) {
    redirect('/404');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Configurações da Instituição</h1>
      <InstitutionSettingsForm institution={institution} />
    </div>
  );
}
