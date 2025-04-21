import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MUIThemeProvider, Theme, PaletteMode } from '@mui/material';
import { createAppTheme } from '../../theme';

// Тип контекста темы
interface ThemeModeContextType {
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  isDarkMode: boolean;
  currentTheme: 'light' | 'dark' | 'system';
  theme: Theme;
}

// Создаем контекст
const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

// Константы для localStorage
const THEME_STORAGE_KEY = 'pms-theme-mode';
type ThemePreference = 'light' | 'dark' | 'system';

/**
 * Поставщик контекста темы
 * Управляет состоянием темы и предоставляет функции для её настройки
 */
export const ThemeModeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Определяет системную тему пользователя
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Получаем сохраненную настройку темы
  const getInitialThemePreference = (): ThemePreference => {
    const savedPreference = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedPreference && ['light', 'dark', 'system'].includes(savedPreference)) {
      return savedPreference as ThemePreference;
    }
    return 'system'; // По умолчанию используем системные настройки
  };

  // Состояние для хранения предпочтения темы
  const [themePreference, setThemePreference] = useState<ThemePreference>(getInitialThemePreference);
  
  // Вычисляем текущую тему на основе предпочтений
  const computeThemeMode = (): PaletteMode => {
    if (themePreference === 'system') {
      return prefersDarkMode ? 'dark' : 'light';
    }
    return themePreference;
  };
  
  // Состояние текущего режима темы
  const [mode, setMode] = useState<PaletteMode>(computeThemeMode);

  // Создаем тему с настройками из theme.ts
  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  // Функция для переключения между светлой и темной темами
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setThemePreference(newMode);
    setMode(newMode);
  };
  
  // Функция для установки конкретного режима темы
  const setThemeMode = (newPreference: ThemePreference) => {
    setThemePreference(newPreference);
    if (newPreference === 'system') {
      setMode(prefersDarkMode ? 'dark' : 'light');
    } else {
      setMode(newPreference);
    }
  };

  // Сохраняем предпочтение темы в localStorage
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themePreference);
  }, [themePreference]);

  // Слушаем изменения системной темы
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Обновляем тему только если выбраны системные настройки
      if (themePreference === 'system') {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    // Современный способ добавления слушателя
    mediaQuery.addEventListener('change', handleChange);
    
    // Очищаем слушатель при размонтировании
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference]);

  const contextValue = {
    toggleTheme,
    setThemeMode,
    isDarkMode: mode === 'dark',
    currentTheme: themePreference,
    theme,
  };

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>
        {children}
      </MUIThemeProvider>
    </ThemeModeContext.Provider>
  );
};

/**
 * Хук для использования контекста темы
 */
export const useThemeMode = (): ThemeModeContextType => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode должен использоваться внутри ThemeModeProvider');
  }
  return context;
};

export default ThemeModeProvider;