// src/theme.ts
import { createTheme } from '@mui/material/styles';

// Defina os temas claro e escuro
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2', // Exemplo de cor primária
        },
        background: {
            default: '#ffffff',
        },
    },
});

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
        },
        background: {
            default: '#121212',
        },
    },
});
