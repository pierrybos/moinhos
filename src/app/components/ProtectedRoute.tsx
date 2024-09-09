// src/components/ProtectedRoute.tsx
"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Container, Typography, Button } from "@mui/material";

// Tipo das propriedades que o ProtectedRoute recebe
type ProtectedRouteProps = {
  children: React.ReactNode; // O conteúdo que será protegido
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { data: session, status } = useSession();

  // Proteção: se a sessão estiver carregando, exibe um estado de carregamento
  if (status === "loading") return <p>Carregando...</p>;

  // Proteção: se o usuário não estiver logado, exibe mensagem e opção de login
  if (!session) {
    return (
      <Container>
        <Typography variant="h6">Você não está autenticado.</Typography>
        <Button onClick={() => signIn()}>Faça login</Button>
      </Container>
    );
  }

  // Proteção: se o usuário não for administrador, exibe acesso negado
  if (!session.user?.isAdmin) {
    return (
      <Container>
        <Typography variant="h6">
          Acesso Negado. Você não tem permissão para acessar esta página.
        </Typography>
        <Button onClick={() => signOut()}>Sair</Button>
      </Container>
    );
  }

  // Se o usuário estiver autenticado e for administrador, renderiza o conteúdo
  return <>{children}</>;
};

export default ProtectedRoute;
