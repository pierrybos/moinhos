// src/app/ClientProvider.tsx
"use client"; // Este arquivo é um componente do lado do cliente

import { ReactNode } from "react";
import { ThemeContextProvider } from "./ThemeContext"; // Contexto de tema
import Navbar from "./Navbar"; // Navbar para exibir na aplicação
import { CssBaseline, GlobalStyles, Box } from "@mui/material";
import SessionWrapper from "./sessionWrapper";

export default function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <GlobalStyles
        styles={(theme) => ({
          body: {
            backgroundColor: theme.palette.background.default, // Fundo dinâmico do tema
            color: theme.palette.text.primary, // Cor do texto do tema
            minHeight: "100vh",
            margin: 0,
            padding: 0,
          },
          "#__next": {
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          },
        })}
      />
      <Box
        sx={{
          backgroundColor: "background.default", // Usa o background do tema
          color: "text.primary", // Usa a cor do texto do tema
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SessionWrapper>
          <Navbar />
          {children}
        </SessionWrapper>
      </Box>
    </ThemeContextProvider>
  );
}
