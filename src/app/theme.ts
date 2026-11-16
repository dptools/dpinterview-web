'use client';
import type {} from '@mui/lab/themeAugmentation'; 
import {createTheme} from '@mui/material/styles';

const theme = createTheme({
    cssVariables: true,
    colorSchemes: {
        light: true,
        dark: false, // Disabled pending compatibility
    },
    components: {
        MuiTimeline: {
            styleOverrides: {},
        },
    },
    typography: {
        fontFamily: 'var(--font-geist-sans)',
    },
});

export default theme;
