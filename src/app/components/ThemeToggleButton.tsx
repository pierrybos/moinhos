// src/components/ThemeToggleButton.tsx
"use client";

import React from "react";
import { IconButton } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeContext } from "./ThemeContext"; // Importa o contexto de tema

const ThemeToggleButton = () => {
  const { toggleTheme, isDarkMode } = useThemeContext();

  return (
    <IconButton onClick={toggleTheme} color="inherit">
      {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
};

export default ThemeToggleButton;
