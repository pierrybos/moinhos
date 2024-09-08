// src/components/Navbar.tsx
"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import ThemeToggleButton from "./ThemeToggleButton"; // Importe o ThemeToggleButton

const Navbar = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Minha Aplicação
        </Typography>

        {/* Opções visíveis para todos */}
        <Button
          color="inherit"
          component={Link}
          href="/formulario"
          startIcon={<HomeIcon />}
        >
          Formulário
        </Button>
        <Button
          color="inherit"
          component={Link}
          href="/arquivos"
          startIcon={<DescriptionIcon />}
        >
          Arquivos
        </Button>

        {/* Opções apenas para usuários logados */}
        {session && (
          <>
            <Button
              color="inherit"
              component={Link}
              href="/admin"
              startIcon={<AccountCircleIcon />}
            >
              Perfil
            </Button>

            {/* Opção adicional para administradores */}
            {isAdmin && (
              <Button
                color="inherit"
                component={Link}
                href="/admin/users"
                startIcon={<AdminPanelSettingsIcon />}
              >
                Lista de Usuários
              </Button>
            )}

            <Button
              color="inherit"
              onClick={() => signOut()}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </>
        )}

        {/* Opção de login para usuários não logados */}
        {!session && (
          <Button
            color="inherit"
            onClick={() => signIn()}
            startIcon={<LoginIcon />}
          >
            Login
          </Button>
        )}

        {/* Botão de Troca de Tema */}
        <Box sx={{ ml: 2 }}>
          <ThemeToggleButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
