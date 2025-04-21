import { createTheme, PaletteMode } from '@mui/material/styles';
import { alpha } from '@mui/material';

// Функция создания темы в зависимости от режима (светлый/тёмный)
export const createAppTheme = (mode: PaletteMode) => {
  // Общие цвета для обеих тем
  const primaryMain = '#1976d2';
  const secondaryMain = '#e91e63';
  const errorMain = '#f44336';
  const warningMain = '#ff9800';
  const infoMain = '#2196f3';
  const successMain = '#4caf50';

  return createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Светлая тема
            primary: {
              main: primaryMain,
              light: alpha(primaryMain, 0.8),
              dark: '#0d47a1',
              contrastText: '#ffffff',
            },
            secondary: {
              main: secondaryMain,
              light: '#f06292',
              dark: '#ad1457',
            },
            background: {
              default: '#f5f5f7',
              paper: '#ffffff',
            },
            error: {
              main: errorMain,
            },
            warning: {
              main: warningMain,
            },
            info: {
              main: infoMain,
            },
            success: {
              main: successMain,
            },
            text: {
              primary: '#212121',
              secondary: '#666666',
            },
            divider: 'rgba(0,0,0,0.12)',
          }
        : {
            // Тёмная тема - мягкие тёмно-серые тона (как в Яндекс.Документы)
            primary: {
              main: '#90caf9',
              light: '#e3f2fd',
              dark: '#42a5f5',
              contrastText: '#121212',
            },
            secondary: {
              main: '#f48fb1',
              light: '#f8bbd0',
              dark: '#c2185b',
            },
            background: {
              default: '#2C2C2E', // Тёмно-серый фон
              paper: '#3A3A3C',  // Менее тёмный для карточек
            },
            error: {
              main: '#f06292',
              light: '#e57373',
            },
            warning: {
              main: '#ffb74d',
              light: '#ffcc80',
            },
            info: {
              main: '#81d4fa',
              light: '#b3e5fc', 
            },
            success: {
              main: '#81c784',
              light: '#a5d6a7',
            },
            text: {
              primary: '#ffffff',
              secondary: '#b0b0b0',
            },
            divider: 'rgba(255,255,255,0.12)',
          }),
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: mode === 'dark' 
              ? '0 1px 3px 0 rgba(0,0,0,0.3), 0 1px 1px 0 rgba(0,0,0,0.14), 0 2px 1px -1px rgba(0,0,0,0.12)'
              : '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 1px 0 rgba(0,0,0,0.07), 0 2px 1px -1px rgba(0,0,0,0.06)'
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: mode === 'dark' 
              ? 'linear-gradient(180deg, #3A3A3C 0%, #323234 100%)' 
              : null,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};

// Экспорт темы по умолчанию (светлая)
export const theme = createAppTheme('light');