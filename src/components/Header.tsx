import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Button, Box, useScrollTrigger, 
  Slide, Fade, useTheme, alpha, Tooltip, Badge, IconButton
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CreateIssueModal from '@/components/CreateIssueModal';
import { Issue } from '@/types/issue';
import { motion } from 'framer-motion';
import { useThemeMode } from '@/shared/contexts/ThemeContext';

/**
 * Компонент для скрытия header при скролле вниз
 * @param props - Свойства компонента
 * @returns React компонент
 */
function HideOnScroll(props: { children: React.ReactElement }) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

/**
 * Header компонент с навигацией по страницам и кнопкой создания задачи
 * Добавлены плавные анимации и визуализация активного раздела
 * @returns React компонент
 */
export default function Header() {
  const theme = useTheme();
  const location = useLocation();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { toggleTheme, isDarkMode } = useThemeMode();
  
  // Определяем активную страницу для подсветки в меню
  const currentPath = location.pathname;

  // Эффект для отслеживания скролла страницы
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /**
   * Обработчик создания новой задачи
   * @param task - Созданная задача
   */
  const handleCreateTask = (task: Issue) => {
    // Task created successfully
    setCreateModalOpen(false);
  };

  /**
   * Проверяет, является ли путь активным
   * @param path - Проверяемый путь
   * @returns true, если путь активен
   */
  const isActivePath = (path: string) => {
    if (path === '/boards' && currentPath === '/boards') return true;
    if (path === '/issues' && currentPath === '/issues') return true;
    if (path === '/board' && currentPath.startsWith('/board/')) return true;
    if (path === '/kanban' && currentPath === '/kanban') return true;
    if (path === '/faq' && currentPath === '/faq') return true;
    return false;
  };

  // Получение цветов для навигационного меню в зависимости от темы
  const getNavColors = () => {
    if (isDarkMode) {
      return {
        buttonColor: scrolled ? 'primary' : 'inherit',
        activeButtonBorder: scrolled 
          ? `2px solid ${theme.palette.primary.light}` 
          : `2px solid ${theme.palette.primary.light}`,
        buttonHoverBg: alpha(theme.palette.primary.main, 0.2),
        buttonTextColor: scrolled ? theme.palette.primary.light : '#ffffff'
      };
    } else {
      return {
        buttonColor: scrolled ? 'inherit' : 'inherit',
        activeButtonBorder: scrolled 
          ? `2px solid ${theme.palette.primary.main}` 
          : `2px solid ${theme.palette.primary.contrastText}`,
        buttonHoverBg: alpha(theme.palette.primary.main, 0.1),
        buttonTextColor: scrolled ? theme.palette.text.primary : theme.palette.primary.contrastText
      };
    }
  };

  const navColors = getNavColors();

  return (
    <>
      <HideOnScroll>
        <AppBar 
          position="sticky" 
          elevation={scrolled ? 4 : 1}
          sx={{
            backgroundColor: scrolled 
              ? alpha(theme.palette.background.paper, 0.85)
              : isDarkMode 
                ? '#1A1A1C' // Более тёмный и контрастный фон для тёмной темы
                : theme.palette.primary.main,
            backdropFilter: scrolled ? 'blur(8px)' : 'none',
            color: scrolled ? theme.palette.text.primary : theme.palette.primary.contrastText,
            transition: theme.transitions.create(['background-color', 'box-shadow', 'color'], {
              duration: theme.transitions.duration.standard
            })
          }}
        >
          <Toolbar>
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              <Tooltip title="Все задачи проекта">
                <Button 
                  component={Link} 
                  to="/issues" 
                  color={navColors.buttonColor}
                  startIcon={
                    <motion.div
                      animate={{ rotate: isActivePath('/issues') ? [0, -10, 0, 10, 0] : 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Badge 
                        color="secondary" 
                        variant={isActivePath('/issues') ? 'dot' : 'standard'}
                        invisible={!isActivePath('/issues')}
                      >
                        <AssignmentIcon />
                      </Badge>
                    </motion.div>
                  }
                  sx={{
                    borderBottom: isActivePath('/issues') 
                      ? navColors.activeButtonBorder
                      : '2px solid transparent',
                    borderRadius: 0,
                    mx: 0.5,
                    color: navColors.buttonTextColor,
                    transition: theme.transitions.create(['border', 'background-color'], {
                      duration: theme.transitions.duration.shorter
                    }),
                    '&:hover': {
                      backgroundColor: navColors.buttonHoverBg,
                      borderBottom: navColors.activeButtonBorder
                    }
                  }}
                >
                  Задачи
                </Button>
              </Tooltip>

              <Tooltip title="Список досок">
                <Button 
                  component={Link} 
                  to="/boards" 
                  color={navColors.buttonColor}
                  startIcon={
                    <motion.div
                      animate={{ rotate: isActivePath('/boards') ? [0, -10, 0, 10, 0] : 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Badge 
                        color="secondary" 
                        variant={isActivePath('/boards') ? 'dot' : 'standard'}
                        invisible={!isActivePath('/boards')}
                      >
                        <DashboardIcon />
                      </Badge>
                    </motion.div>
                  }
                  sx={{
                    borderBottom: isActivePath('/boards') 
                      ? navColors.activeButtonBorder
                      : '2px solid transparent',
                    borderRadius: 0,
                    mx: 0.5,
                    color: navColors.buttonTextColor,
                    transition: theme.transitions.create(['border', 'background-color'], {
                      duration: theme.transitions.duration.shorter
                    }),
                    '&:hover': {
                      backgroundColor: navColors.buttonHoverBg,
                      borderBottom: navColors.activeButtonBorder
                    }
                  }}
                >
                  Доски
                </Button>
              </Tooltip>

              <Tooltip title="Kanban-доска">
                <Button 
                  component={Link} 
                  to="/kanban" 
                  color={navColors.buttonColor}
                  startIcon={
                    <motion.div
                      animate={{ rotate: isActivePath('/kanban') ? [0, -10, 0, 10, 0] : 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Badge 
                        color="secondary" 
                        variant={isActivePath('/kanban') ? 'dot' : 'standard'}
                        invisible={!isActivePath('/kanban')}
                      >
                        <ViewKanbanIcon />
                      </Badge>
                    </motion.div>
                  }
                  sx={{
                    borderBottom: isActivePath('/kanban') 
                      ? navColors.activeButtonBorder
                      : '2px solid transparent',
                    borderRadius: 0,
                    mx: 0.5,
                    color: navColors.buttonTextColor,
                    transition: theme.transitions.create(['border', 'background-color'], {
                      duration: theme.transitions.duration.shorter
                    }),
                    '&:hover': {
                      backgroundColor: navColors.buttonHoverBg,
                      borderBottom: navColors.activeButtonBorder
                    }
                  }}
                >
                  Kanban
                </Button>
              </Tooltip>

              <Tooltip title="Помощь и FAQ">
                <Button 
                  component={Link} 
                  to="/faq" 
                  color={navColors.buttonColor}
                  startIcon={
                    <motion.div
                      animate={{ rotate: isActivePath('/faq') ? [0, -10, 0, 10, 0] : 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Badge 
                        color="secondary" 
                        variant={isActivePath('/faq') ? 'dot' : 'standard'}
                        invisible={!isActivePath('/faq')}
                      >
                        <HelpOutlineIcon />
                      </Badge>
                    </motion.div>
                  }
                  sx={{
                    borderBottom: isActivePath('/faq') 
                      ? navColors.activeButtonBorder
                      : '2px solid transparent',
                    borderRadius: 0,
                    mx: 0.5,
                    color: navColors.buttonTextColor,
                    transition: theme.transitions.create(['border', 'background-color'], {
                      duration: theme.transitions.duration.shorter
                    }),
                    '&:hover': {
                      backgroundColor: navColors.buttonHoverBg,
                      borderBottom: navColors.activeButtonBorder
                    }
                  }}
                >
                  Помощь
                </Button>
              </Tooltip>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title={isDarkMode ? "Переключить на светлую тему" : "Переключить на темную тему"}>
                <IconButton onClick={toggleTheme} color={scrolled ? "inherit" : "inherit"}>
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              
              <Fade in={true}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant={scrolled ? "contained" : "outlined"} 
                    color={scrolled ? "primary" : "inherit"}
                    startIcon={<AddIcon />}
                    onClick={() => setCreateModalOpen(true)}
                    sx={{
                      borderColor: isDarkMode 
                        ? theme.palette.primary.light
                        : theme.palette.primary.contrastText,
                      boxShadow: scrolled ? 2 : 0,
                      '&:hover': {
                        boxShadow: scrolled ? 4 : 0,
                      }
                    }}
                  >
                    Создать задачу
                  </Button>
                </motion.div>
              </Fade>
            </Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      
      <Toolbar /> {/* Этот Toolbar для предотвращения скрытия контента под AppBar */}

      <CreateIssueModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateTask}
      />
    </>
  );
}
