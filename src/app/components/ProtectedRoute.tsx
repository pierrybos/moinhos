// src/components/ProtectedRoute.tsx
"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Container, Typography, Button } from "@mui/material";
import { checkRole } from "@/utils/authUtils";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: string; // Definindo o role necessário para a rota
  msg?: string; // Mensagem personalizada para quando o acesso é negado
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = "default", // Role padrão é "default"
  msg = "Você não está autenticado.",
}) => {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Carregando...</p>;

  if (!session) {
    return (
      <Container>
        <Typography variant="h6">{msg}</Typography>
        <Button onClick={() => signIn()}>Faça login</Button>
      </Container>
    );
  }

  if (!checkRole(session.user, requiredRole)) {
    return (
      <Container>
        <Typography variant="h6">
          Acesso Negado. Você não tem permissão para acessar esta página.
        </Typography>
        <Button onClick={() => signOut()}>Sair</Button>
      </Container>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
