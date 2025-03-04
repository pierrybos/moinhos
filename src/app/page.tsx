"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@mui/material/styles";

interface Institution {
  id: number;
  name: string;
  slug: string;
}

export default function Home() {
  const theme = useTheme();
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  useEffect(() => {
    fetch('/api/institutions')
      .then(res => res.json())
      .then(data => setInstitutions(data))
      .catch(error => console.error('Error fetching institutions:', error));
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-8 gap-8"
      style={{
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      {/* Card de Seleção de Instituição */}
      <div
        className="shadow-md rounded-lg p-6 max-w-md w-full flex flex-col items-center text-center"
        style={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <h1 className="text-2xl font-bold mb-4">Selecione sua Instituição</h1>
        <div className="grid grid-cols-1 gap-4 w-full">
          {institutions.map((institution) => (
            <Link
              key={institution.id}
              href={`/${institution.slug}`}
              className="rounded-lg border border-solid transition-colors bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base p-4 flex items-center justify-center"
              style={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              }}
            >
              {institution.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Seção de Informações */}
      <div
        className="shadow-md rounded-lg p-6 max-w-md w-full text-center"
        style={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <h2 className="text-xl font-semibold mb-4">Sobre o Sistema</h2>
        <p className="text-sm sm:text-base">
          Este é um sistema de gerenciamento de arquivos para instituições. 
          Cada instituição tem seu próprio espaço para gerenciar uploads, 
          participantes e configurações.
        </p>
      </div>
    </div>
  );
}
