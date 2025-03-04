'use client';

import { useEffect, useState } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Session } from 'next-auth';
import InstitutionSettingsForm from './InstitutionSettingsForm';
import { useParams } from 'next/navigation';
import { InstitutionWithDriveConfig } from '@/types/institution';

export default function SettingsPage() {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const [institution, setInstitution] = useState<InstitutionWithDriveConfig | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getServerSession();
      setSession(session);
    };

    fetchSession();
  }, []);

  useEffect(() => {
    const fetchInstitution = async () => {
      if (!session) {
        redirect(`/${institutionId}/login`);
      }

      try {
        const response = await fetch(`/api/institutions/${institutionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch institution');
        }
        const data = await response.json();
        setInstitution(data);
      } catch (error) {
        console.error('Error fetching institution:', error);
      }
    };

    fetchInstitution();
  }, [session, institutionId]);

  if (!institution) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Configurações da Instituição</h1>
      <InstitutionSettingsForm institution={institution} />
    </div>
  );
}
