"use client";
import Link from "next/link";
import { useTheme } from "@mui/material/styles"; // Importa o hook para acessar o tema

export default function Home() {
  const theme = useTheme(); // Acessa o tema atual (claro ou escuro)

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
          href="/formulario"
          className="rounded-full border border-solid transition-colors bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-12 px-6 flex items-center justify-center"
          style={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }}
        >
          Formulário
        </Link>
        <p className="mt-4 text-sm sm:text-base">
          Recebeu um convite para participar de nossos cultos? Envie seus
          arquivos com antecedência, incluindo playbacks, apresentações, fotos
          ou qualquer material que será utilizado no dia de sua participação.
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
          href="/arquivos"
          className="rounded-full border border-solid transition-colors bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-12 px-6 flex items-center justify-center"
          style={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }}
        >
          Arquivos
        </Link>
        <p className="mt-4 text-sm sm:text-base">
          Consulte o status, a situação dos seus arquivos para verificar se
          foram recebidos corretamente pela nossa equipe ou se havera a
          necessidade de reenvio devido alguma incompatibilidade.
        </p>
      </div>
    </div>
  );
}
