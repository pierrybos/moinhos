"use client";
import Link from "next/link";
import { useTheme } from "@mui/material/styles";

export default function InstitutionHome({ params }: { params: { institutionId: string } }) {
  const theme = useTheme();

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-8 gap-8"
      style={{
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      {/* Card do Formulário */}
      <div
        className="shadow-md rounded-lg p-6 max-w-md w-full flex flex-col items-center text-center"
        style={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <Link
          href={`/${params.institutionId}/formulario`}
          className="rounded-full border border-solid transition-colors bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-12 px-6 flex items-center justify-center"
          style={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }}
        >
          Enviar Arquivos
        </Link>
        <p className="mt-4 text-sm sm:text-base">
          Recebeu um convite para participar? Envie seus arquivos com antecedência, 
          incluindo playbacks, apresentações, fotos ou qualquer material que será 
          utilizado no dia de sua participação.
        </p>
      </div>

      {/* Card dos Arquivos */}
      <div
        className="shadow-md rounded-lg p-6 max-w-md w-full flex flex-col items-center text-center"
        style={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <Link
          href={`/${params.institutionId}/arquivos`}
          className="rounded-full border border-solid transition-colors bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-12 px-6 flex items-center justify-center"
          style={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }}
        >
          Consultar Arquivos
        </Link>
        <p className="mt-4 text-sm sm:text-base">
          Verifique o status e a situação dos seus arquivos para confirmar se
          foram recebidos corretamente pela nossa equipe.
        </p>
      </div>

      {/* Card de Configurações (apenas para admins) */}
      <div
        className="shadow-md rounded-lg p-6 max-w-md w-full flex flex-col items-center text-center"
        style={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <Link
          href={`/${params.institutionId}/settings`}
          className="rounded-full border border-solid transition-colors bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-12 px-6 flex items-center justify-center"
          style={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }}
        >
          Configurações
        </Link>
        <p className="mt-4 text-sm sm:text-base">
          Gerencie as configurações da instituição, incluindo integrações com Google Drive
          e outras configurações do sistema.
        </p>
      </div>
    </div>
  );
}
