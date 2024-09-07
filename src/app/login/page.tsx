// app/page.tsx (ou qualquer outra página que você queira adicionar o login)
"use client"; // Garante que este é um Client Component

import { useSession, signIn, signOut } from "next-auth/react";
import React from "react";
import { Button, Container, Typography } from "@mui/material";

export default function HomePage() {
  // Usando o hook useSession para obter o estado da sessão atual
  const { data: session, status } = useSession();

  // Renderiza uma mensagem de carregamento enquanto o status da sessão está sendo verificado
  if (status === "loading") {
    return <p>Carregando...</p>;
  }

  return (
    <Container>
      {session ? (
        // Se o usuário está logado, exibe as informações da sessão e botão de logout
        <div>
          <Typography variant="h6">
            Olá, {session.user?.name || "usuário"}!
          </Typography>
          <Typography>Email: {session.user?.email}</Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => signOut()}
          >
            Sair
          </Button>
        </div>
      ) : (
        // Se o usuário não está logado, exibe o botão de login
        <div>
          <Typography variant="h6">Você não está autenticado.</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => signIn("google")}
          >
            Fazer Login com Google
          </Button>
        </div>
      )}
    </Container>
  );
}
