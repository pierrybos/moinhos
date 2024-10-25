// src/components/Navbar.tsx
"use client";

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import ThemeToggleButton from "./ThemeToggleButton"; // Importe o ThemeToggleButton
import ListAltIcon from "@mui/icons-material/ListAlt";
import ChatIcon from "@mui/icons-material/Chat";
import { isAdmin } from "@/utils/authUtils";


import Logo from "./Logo";

const Navbar = () => {
  const { data: session } = useSession();
  const bolIsAdmin = session?.user ? isAdmin(session.user) : false;


  // Estado para controlar o estado do Drawer (menu colapsável)
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Função para abrir ou fechar o Drawer
  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setDrawerOpen(open);
    };

  // Menu de navegação dentro do Drawer
  const drawerMenu = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem component={Link} href="/chat">
          <ListItemIcon>
            <ChatIcon />
          </ListItemIcon>
          <ListItemText primary="Chat" />
        </ListItem>
        <ListItem component={Link} href="/formulario">
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Formulário" />
        </ListItem>
        <ListItem component={Link} href="/arquivos">
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText primary="Arquivos" />
        </ListItem>
        {session && (
          <>
            <ListItem component={Link} href="/admin">
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Perfil" />
            </ListItem>
            {bolIsAdmin && (
              <ListItem component={Link} href="/admin/users">
                <ListItemIcon>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Usuários" />
              </ListItem>
            )}
            {bolIsAdmin && (
              <ListItem component={Link} href="/admin/program-parts">
                <ListItemIcon>
                  <ListAltIcon />
                </ListItemIcon>
                <ListItemText primary="Programação" />
              </ListItem>
            )}
            <ListItem onClick={() => signOut()}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}
        {!session && (
          <ListItem onClick={() => signIn()}>
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary="Login" />
          </ListItem>
        )}
      </List>
      <Divider />
      {/* Botão de Troca de Tema dentro do Drawer */}
      <Box sx={{ p: 2 }}>
        <ThemeToggleButton />
      </Box>
    </Box>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Botão de Menu para telas pequenas */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { xs: "block", md: "none" } }} // Mostra o botão de menu apenas em telas pequenas
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
        >
          <Box
            component="span"
            sx={{ mr: 1, display: { xs: "none", md: "block" } }}
          >
            <Logo width={50} height={50} />
          </Box>
          IASD Moinhos - Multimídia
        </Typography>
        <Box sx={{ display: { md: "none", xs: "block" } }}>
          <Logo width={50} height={50} />
        </Box>
        {/* Botões visíveis apenas em telas maiores */}
        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          <Button
            color="inherit"
            component={Link}
            href="/chat"
            startIcon={<ChatIcon />}
          >
            Chat
          </Button>
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
              {bolIsAdmin && (
                <Button
                  color="inherit"
                  component={Link}
                  href="/admin/users"
                  startIcon={<AdminPanelSettingsIcon />}
                >
                  Usuários
                </Button>
              )}
              {bolIsAdmin && (
                <Button
                  color="inherit"
                  component={Link}
                  href="/admin/program-parts"
                  startIcon={<ListAltIcon />}
                >
                  Programação
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
          {!session && (
            <Button
              color="inherit"
              onClick={() => signIn()}
              startIcon={<LoginIcon />}
            >
              Login
            </Button>
          )}
          <Box sx={{ ml: 2 }}>
            <ThemeToggleButton />
          </Box>
        </Box>
      </Toolbar>

      {/* Drawer que aparece ao clicar no botão de menu */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerMenu}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
