// src/theme.ts
import { createTheme } from '@mui/material/styles';

// Tema Claro
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2', // Cor primária do tema claro
        },
        secondary: {
            main: '#f50057', // Exemplo de cor secundária
        },
        background: {
            default: '#f5f5f5', // Fundo suave para modo claro
            paper: '#f3f3f3',   // Fundo para componentes como Paper
        },
        text: {
            primary: '#000000',  // Cor principal do texto
            secondary: '#333333', // Cor secundária do texto
        },
    },
});

// Tema Escuro
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9', // Cor primária no tema escuro
        },
        secondary: {
            main: '#f48fb1', // Cor secundária no tema escuro
        },
        background: {
            default: '#121212',  // Fundo escuro suave
            paper: '#1e1e1e',    // Fundo para componentes como Paper
        },
        text: {
            primary: '#ffffff',   // Texto claro para contraste
            secondary: '#b0b0b0', // Texto secundário suavemente acinzentado
        },
    },
});
