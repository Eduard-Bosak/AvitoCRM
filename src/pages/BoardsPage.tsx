import React, { useState, useMemo, useEffect } from 'react';
import { 
  Container, Typography, Box, TextField, Grid, Card, CardContent, 
  CardActions, Button, Chip, Divider, IconButton, Avatar, 
  LinearProgress, InputAdornment, Fade, Paper, Alert, Tooltip,
  Badge, CircularProgress, Skeleton, Dialog, DialogTitle, DialogContent,
  DialogActions, Menu, MenuItem, ListItemIcon, ListItemText, Grow
} from '@mui/material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { 
  Search as SearchIcon, 
  Add as AddIcon,
  FilterList as FilterListIcon,
  SortByAlpha as SortIcon,
  Dashboard as DashboardIcon,
  GroupWork as TeamIcon,
  Person as PersonIcon,
  ArrowForward as ArrowIcon,
  PlayArrow as InProgressIcon,
  CheckCircle as DoneIcon,
  FormatListBulleted as BacklogIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
  MoreVert as MoreVertIcon,
  AutoAwesome as SparkleIcon,
  ViewKanban as KanbanIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBoards } from '../shared/hooks/useBoards';
import { Board } from '../types/board';
import BoardsTable from '../components/BoardsTable';
import BoardModal from '../components/BoardModal';
import ErrorBoundary from '../components/ErrorBoundary';
import { useTasks } from '@/shared/hooks/useTasks';
import { useBoardTasks } from '@/shared/hooks/useBoardTasks';
import { motion, AnimatePresence } from 'framer-motion';

// Стилизованные компоненты для технологичного дизайна
const GlassContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  overflow: 'hidden',
  zIndex: 1,
}));

const FloatingParticle = styled(motion.div)(({ theme, size = 6, color = '#4fc3f7' }) => ({
  position: 'absolute',
  width: `${size}px`,
  height: `${size}px`,
  background: color,
  borderRadius: '50%',
  filter: 'blur(1px)',
  zIndex: 0,
}));

const GlowingCircle = styled('div')(({ theme, color = '#3f51b5', size = 300, opacity = 0.3, top = 0, left = 0 }) => ({
  position: 'absolute',
  top: `${top}px`,
  left: `${left}px`,
  width: `${size}px`,
  height: `${size}px`,
  borderRadius: '50%',
  background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
  opacity: opacity,
  filter: 'blur(40px)',
  zIndex: 0,
}));

// Стилизованный заголовок страницы с анимацией
const PageTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  fontWeight: 700,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  display: 'inline-block',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 60,
    height: 3,
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`,
    borderRadius: theme.shape.borderRadius,
    transition: theme.transitions.create(['width']),
  },
  '&:hover::after': {
    width: 120,
  }
}));

// Улучшенная стилизованная карточка доски с эффектами
const BoardCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  transform: 'translateZ(0)',
  willChange: 'transform, box-shadow',
  '&:hover': {
    transform: 'translateY(-12px) translateZ(0)',
    boxShadow: '0 22px 40px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.10)',
    '& .board-card-arrow': {
      transform: 'translateX(4px)',
      opacity: 1,
    },
    '& .board-card-actions': {
      opacity: 1,
      transform: 'translateY(0)',
    },
    '& .board-card-gradient': {
      opacity: 1,
    }
  },
  position: 'relative',
  overflow: 'visible',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 25px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.05)',
  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  backdropFilter: 'blur(5px)',
  backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.8 : 0.9),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    borderTopLeftRadius: theme.shape.borderRadius * 2,
    borderTopRightRadius: theme.shape.borderRadius * 2,
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.dark, 0.9)})`,
  color: theme.palette.primary.contrastText,
  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
  transition: 'all 0.3s',
  borderRadius: theme.shape.borderRadius * 1.5,
  '&:hover': {
    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
    transform: 'translateY(-2px)'
  }
}));

const GlassPanel = styled(Paper)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.7 : 0.8),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`,
    zIndex: 1
  }
}));

/**
 * Страница со списком досок проекта с улучшенным дизайном и счетчиками задач
 */
const BoardsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: boards, isLoading, isError, error, refetch: refetchBoards } = useBoards();
  
  // Получаем все задачи для отображения счетчиков на досках
  const { data: allTasks, isLoading: isTasksLoading } = useTasks();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [filterByTeam, setFilterByTeam] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTaskCounts, setShowTaskCounts] = useState(true);

  // Состояние для хранения ID виртуально удаленных досок
  const [deletedBoardIds, setDeletedBoardIds] = useState<Set<number>>(new Set());
  const [trashModalOpen, setTrashModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogType, setConfirmDialogType] = useState<'trash' | 'restore' | 'delete'>('trash');
  const [targetBoard, setTargetBoard] = useState<Board | null>(null);
  const [boardContextMenu, setBoardContextMenu] = useState<{
    position: { top: number; left: number };
    boardId: number;
    open: boolean;
  }>({
    position: { top: 0, left: 0 },
    boardId: 0,
    open: false
  });
  
  // Состояние для анимированных частиц фона
  const [particles, setParticles] = useState<Array<{
    x: number, 
    y: number, 
    size: number, 
    color: string,
    initialX: number,
    initialY: number,
  }>>([]);
  
  // Создаем частицы для эффекта технологичности
  useEffect(() => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.info.main,
      alpha(theme.palette.success.main, 0.7),
    ];
    
    const newParticles = Array.from({ length: 15 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
    }));
    
    setParticles(newParticles);
  }, [theme]);

  // Загрузка виртуально удаленных досок из localStorage при монтировании компонента
  useEffect(() => {
    try {
      const savedDeletedBoardIds = localStorage.getItem('deletedBoardIds');
      if (savedDeletedBoardIds) {
        setDeletedBoardIds(new Set(JSON.parse(savedDeletedBoardIds)));
      }
    } catch (error) {
      console.error("Ошибка при загрузке удаленных досок:", error);
    }
  }, []);

  // Сохранение виртуально удаленных досок в localStorage при изменении
  useEffect(() => {
    if (deletedBoardIds.size > 0) {
      localStorage.setItem('deletedBoardIds', JSON.stringify(Array.from(deletedBoardIds)));
    } else {
      localStorage.removeItem('deletedBoardIds');
    }
  }, [deletedBoardIds]);

  // Получаем уникальные команды из досок
  const teams = useMemo(() => {
    if (!boards) return [];
    const teamSet = new Set<string>();
    boards.forEach(board => {
      if (board.team) teamSet.add(board.team);
    });
    return Array.from(teamSet).sort();
  }, [boards]);

  // Рассчитываем количество задач на каждой доске по статусам
  const boardTaskCounts = useMemo(() => {
    if (!boards || !allTasks) return {};
    
    const counts: Record<number, { total: number, backlog: number, inProgress: number, done: number }> = {};
    
    boards.forEach(board => {
      counts[board.id] = { total: 0, backlog: 0, inProgress: 0, done: 0 };
    });
    
    allTasks.forEach(task => {
      const boardId = task.boardId;
      if (boardId && counts[boardId]) {
        counts[boardId].total++;
        
        if (task.status === 'Backlog') {
          counts[boardId].backlog++;
        } else if (task.status === 'InProgress') {
          counts[boardId].inProgress++;
        } else if (task.status === 'Done') {
          counts[boardId].done++;
        }
      }
    });
    
    return counts;
  }, [boards, allTasks]);

  // Фильтрация и сортировка досок с учетом удаленных
  const filteredBoards = useMemo(() => {
    if (!boards) return [];
    
    return boards
      .filter(board => {
        // Исключаем удаленные доски
        if (deletedBoardIds.has(board.id)) return false;
        
        // Фильтр по поиску
        const matchesSearch = !searchQuery || 
          board.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          board.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Фильтр по команде
        const matchesTeam = !filterByTeam || board.team === filterByTeam;
        
        return matchesSearch && matchesTeam;
      })
      .sort((a, b) => {
        // Сортировка по имени
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        
        if (sortOrder === 'asc') {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
  }, [boards, searchQuery, filterByTeam, sortOrder, deletedBoardIds]);

  // Получаем список удаленных досок
  const deletedBoards = useMemo(() => {
    if (!boards) return [];
    return boards.filter(board => deletedBoardIds.has(board.id));
  }, [boards, deletedBoardIds]);

  // Обработчик клика по карточке доски
  const handleBoardClick = (boardId: number) => {
    navigate(`/board/${boardId}`);
  };

  // Обработчик создания новой доски
  const handleCreateBoard = () => {
    setOpenModal(true);
  };

  // Обработчик обновления данных
  const handleRefresh = () => {
    setIsRefreshing(true);
    Promise.all([
      refetchBoards()
    ]).finally(() => {
      setIsRefreshing(false);
    });
  };

  // Открыть контекстное меню для доски
  const handleBoardContextMenu = (event: React.MouseEvent, boardId: number) => {
    event.preventDefault();
    event.stopPropagation();
    setBoardContextMenu({
      position: { top: event.clientY, left: event.clientX },
      boardId,
      open: true
    });
  };

  // Закрыть контекстное меню
  const handleCloseContextMenu = () => {
    setBoardContextMenu(prev => ({ ...prev, open: false }));
  };

  // Показать диалог подтверждения с указанным типом и целевой доской
  const showConfirmDialog = (type: 'trash' | 'restore' | 'delete', board: Board) => {
    setConfirmDialogType(type);
    setTargetBoard(board);
    setConfirmDialogOpen(true);
  };

  // Виртуальное удаление доски (перемещение в корзину)
  const handleMoveToTrash = (board: Board) => {
    showConfirmDialog('trash', board);
  };

  // Восстановление доски из корзины
  const handleRestoreBoard = (board: Board) => {
    showConfirmDialog('restore', board);
  };

  // Подтверждение действия с доской
  const handleConfirmAction = () => {
    if (!targetBoard) return;

    if (confirmDialogType === 'trash') {
      // Добавляем ID доски в состояние удаленных досок
      setDeletedBoardIds(prev => new Set(prev).add(targetBoard.id));
      // Закрываем модальное окно если оно открыто
      handleCloseContextMenu();
    } else if (confirmDialogType === 'restore') {
      // Удаляем ID доски из состояния удаленных досок
      setDeletedBoardIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetBoard.id);
        return newSet;
      });
    } else if (confirmDialogType === 'delete') {
      // TODO: Реализовать окончательное удаление доски через API (если это требуется)
      console.log(`Запрос на окончательное удаление доски ${targetBoard.id}`);
      
      // Удаляем доску из списка виртуально удаленных для совместимости
      setDeletedBoardIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetBoard.id);
        return newSet;
      });
    }

    setConfirmDialogOpen(false);
    setTargetBoard(null);
  };

  // Очистка корзины
  const handleClearTrash = () => {
    setDeletedBoardIds(new Set());
    setTrashModalOpen(false);
  };

  return (
    <ErrorBoundary>
      <GlassContainer maxWidth="xl">
        {/* Декоративные элементы фона */}
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <GlowingCircle color={theme.palette.primary.main} size={500} opacity={0.1} top={-100} left={-100} />
          <GlowingCircle color={theme.palette.secondary.main} size={500} opacity={0.08} top={300} left={window.innerWidth - 300} />
          <GlowingCircle color={theme.palette.info.main} size={400} opacity={0.05} top={600} left={200} />
          
          {/* Анимированные частицы */}
          {particles.map((particle, index) => (
            <FloatingParticle
              key={index}
              size={particle.size}
              color={particle.color}
              initial={{ 
                x: `${particle.initialX}%`, 
                y: `${particle.initialY}%`,
                opacity: 0.2 + Math.random() * 0.4
              }}
              animate={{
                x: [
                  `${particle.initialX}%`, 
                  `${particle.initialX + (Math.random() * 15 - 7.5)}%`, 
                  `${particle.initialX}%`
                ],
                y: [
                  `${particle.initialY}%`, 
                  `${particle.initialY + (Math.random() * 15 - 7.5)}%`, 
                  `${particle.initialY}%`
                ],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                repeat: Infinity,
                duration: 5 + Math.random() * 10,
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Декоративные круги/орбиты */}
          <Box
            component={motion.div}
            sx={{
              position: 'fixed',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              top: '10%',
              right: '5%',
              zIndex: 0,
              pointerEvents: 'none',
            }}
            animate={{
              rotate: 360,
            }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          />
          <Box
            component={motion.div}
            sx={{
              position: 'fixed',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
              bottom: '10%',
              left: '5%',
              zIndex: 0,
              pointerEvents: 'none',
            }}
            animate={{
              rotate: -360,
            }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          />
        </Box>
        
        {/* Заголовок страницы и действия */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            flexWrap: 'wrap',
            gap: 2,
            position: 'relative',
            zIndex: 1,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ display: 'inline-block' }}
              >
                <SparkleIcon 
                  sx={{ 
                    fontSize: 30,
                    color: theme.palette.warning.main,
                    filter: `drop-shadow(0 0 5px ${alpha(theme.palette.warning.main, 0.5)})`,
                    mr: 1
                  }} 
                />
              </motion.div>
              
              <Box>
                <PageTitle variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Доски проектов
                </PageTitle>
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 0.5
                  }}
                >
                  <KanbanIcon 
                    fontSize="small" 
                    color="action" 
                    sx={{ mr: 0.5, opacity: 0.8 }}
                  />
                  Управляйте досками проектов и задачами
                  {deletedBoardIds.size > 0 && (
                    <Chip 
                      label={`В корзине: ${deletedBoardIds.size}`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ ml: 1, borderRadius: 1 }}
                    />
                  )}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {deletedBoardIds.size > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  style={{ position: 'relative', overflow: 'hidden' }}
                >
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<DeleteIcon />}
                    onClick={() => setTrashModalOpen(true)}
                    sx={{ 
                      borderRadius: theme.shape.borderRadius * 1.5,
                      borderWidth: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(to right, transparent 0%, ${alpha(theme.palette.secondary.main, 0.2)} 50%, transparent 100%)`,
                        transition: 'all 0.6s ease',
                      },
                      '&:hover::after': {
                        left: '100%',
                      }
                    }}
                  >
                    Корзина ({deletedBoardIds.size})
                  </Button>
                </motion.div>
              )}
                
              <motion.div
                whileHover={{ rotate: isRefreshing ? 0 : 180 }}
                transition={{ duration: 0.5 }}
              >
                <Tooltip title="Обновить данные">
                  <IconButton 
                    color="primary" 
                    onClick={handleRefresh} 
                    disabled={isRefreshing}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                    }}
                  >
                    <RefreshIcon 
                      sx={{ 
                        animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }} 
                    />
                  </IconButton>
                </Tooltip>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <GradientButton 
                  startIcon={<AddIcon />}
                  onClick={handleCreateBoard}
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(to right, transparent 0%, ${alpha('#fff', 0.3)} 50%, transparent 100%)`,
                      transition: 'all 0.6s ease',
                    },
                    '&:hover::after': {
                      left: '100%',
                    }
                  }}
                >
                  Создать доску
                </GradientButton>
              </motion.div>
            </Box>
          </Box>
        </motion.div>
        
        {/* Панель с поиском и фильтрами */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassPanel 
            elevation={0}
            sx={{ p: 3, mb: 4 }}
          >
            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                gap: 2,
                alignItems: "center"
              }}
            >
              <Box>
                <TextField
                  fullWidth
                  placeholder="Поиск досок по названию или описанию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      transition: 'all 0.3s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.background.paper, 0.7),
                      },
                      '&.Mui-focused': {
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                      }
                    }
                  }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  {/* Фильтр по команде */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                    {filterByTeam && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      >
                        <Tooltip title="Сбросить фильтр">
                          <Chip 
                            label="Все команды" 
                            color="secondary" 
                            size="small" 
                            onClick={() => setFilterByTeam(null)} 
                            sx={{ 
                              mr: 0.5,
                              fontWeight: 500,
                              borderRadius: '8px',
                              '&:hover': {
                                boxShadow: `0 2px 5px ${alpha(theme.palette.secondary.main, 0.3)}`
                              }
                            }}
                          />
                        </Tooltip>
                      </motion.div>
                    )}
                    
                    {teams.map(team => (
                      <motion.div 
                        key={team}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Chip
                          key={team}
                          label={team}
                          icon={<TeamIcon />}
                          size="small"
                          variant={filterByTeam === team ? "filled" : "outlined"}
                          color={filterByTeam === team ? "primary" : "default"}
                          onClick={() => setFilterByTeam(team === filterByTeam ? null : team)}
                          sx={{ 
                            borderRadius: '8px',
                            transition: 'all 0.2s',
                            ...(filterByTeam === team && {
                              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                            })
                          }}
                        />
                      </motion.div>
                    ))}
                  </Box>
                  
                  {/* Переключатель сортировки */}
                  <motion.div 
                    whileHover={{ rotate: sortOrder === 'asc' ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Tooltip title={sortOrder === 'asc' ? "Сортировка: А-Я" : "Сортировка: Я-А"}>
                      <IconButton 
                        size="small"
                        color={sortOrder === 'desc' ? "primary" : "default"}
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        sx={{ 
                          bgcolor: sortOrder === 'desc' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <SortIcon />
                      </IconButton>
                    </Tooltip>
                  </motion.div>
                </Box>
              </Box>
            </Box>
          </GlassPanel>
        </motion.div>
        
        {/* Состояние загрузки */}
        {(isLoading || isTasksLoading) && (
          <Box sx={{ width: '100%', mb: 4, position: 'relative' }}>
            <LinearProgress 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                background: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  borderRadius: 3,
                }
              }} 
            />
            <Typography 
              variant="body2" 
              color="primary"
              sx={{ 
                mt: 1, 
                textAlign: 'center',
                opacity: 0.7,
                fontStyle: 'italic'
              }}
            >
              Загрузка данных...
            </Typography>
          </Box>
        )}
        
        {/* Состояние ошибки */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Alert 
              severity="error" 
              variant="filled"
              sx={{ 
                mb: 4, 
                borderRadius: 2,
                boxShadow: `0 8px 32px ${alpha(theme.palette.error.dark, 0.2)}`,
              }}
              action={
                <Button color="inherit" onClick={() => refetchBoards()}>
                  Повторить
                </Button>
              }
            >
              Ошибка загрузки досок: {error instanceof Error ? error.message : 'Неизвестная ошибка'}
            </Alert>
          </motion.div>
        )}
        
        {/* Если доски не найдены */}
        {!isLoading && !isError && filteredBoards.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
          >
            <GlassPanel sx={{ textAlign: 'center', py: 6 }}>
              <motion.div
                animate={{ 
                  rotateY: [0, 180, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <DashboardIcon 
                  sx={{ 
                    fontSize: 80, 
                    color: alpha(theme.palette.primary.main, 0.3),
                    mb: 2
                  }} 
                />
              </motion.div>
              <Typography variant="h5" color="text.primary" gutterBottom fontWeight={600}>
                {searchQuery || filterByTeam 
                  ? 'Доски не найдены по заданным параметрам' 
                  : 'Нет доступных досок'}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {searchQuery || filterByTeam 
                  ? 'Попробуйте изменить параметры поиска или фильтрации' 
                  : 'Создайте новую доску, чтобы начать работу с проектами'}
              </Typography>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <GradientButton 
                  startIcon={<AddIcon />} 
                  onClick={handleCreateBoard}
                  sx={{ mt: 2, px: 3, py: 1 }}
                >
                  Создать доску
                </GradientButton>
              </motion.div>
            </GlassPanel>
          </motion.div>
        )}
        
        {/* Отображение досок в виде сетки карточек */}
        <AnimatePresence mode="wait">
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 3
            }}
          >
            {filteredBoards.map((board, index) => {
              const boardTaskCount = boardTaskCounts[board.id] || { total: 0, backlog: 0, inProgress: 0, done: 0 };
              
              return (
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.07,
                    type: 'spring',
                    stiffness: 100 
                  }}
                  layout
                >
                  <BoardCard 
                    onClick={() => handleBoardClick(board.id)}
                    elevation={0}
                    onContextMenu={(e) => handleBoardContextMenu(e, board.id)}
                    sx={{
                      cursor: 'pointer',
                      '&::before': {
                        backgroundColor: board.color || theme.palette.primary.main
                      }
                    }}
                  >
                    {/* Градиентный эффект при наведении */}
                    <Box 
                      className="board-card-gradient"
                      sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: theme.shape.borderRadius * 2,
                        background: `linear-gradient(135deg, ${alpha(board.color || theme.palette.primary.light, 0.15)} 0%, transparent 100%)`,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none',
                        zIndex: 0
                      }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography 
                          variant="h6" 
                          component="h2" 
                          sx={{ 
                            fontWeight: 600, 
                            lineHeight: 1.3,
                            color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.text.primary
                          }} 
                          noWrap
                        >
                          {board.name}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {board.team && (
                            <Tooltip title={`Команда: ${board.team}`}>
                              <Chip
                                size="small"
                                label={board.team}
                                icon={<TeamIcon fontSize="small" />}
                                color="default"
                                variant="outlined"
                                sx={{ 
                                  height: 24,
                                  '& .MuiChip-label': { px: 1, fontSize: '0.7rem', fontWeight: 500 },
                                  '& .MuiChip-icon': { fontSize: '0.8rem', ml: 0.5 },
                                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                                  backdropFilter: 'blur(5px)',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFilterByTeam(board.team === filterByTeam ? null : board.team);
                                }}
                              />
                            </Tooltip>
                          )}
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBoardContextMenu(e, board.id);
                            }}
                            sx={{ 
                              padding: 0.5,
                              color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.text.secondary
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          height: '2.5em'
                        }}
                      >
                        {board.description || 'Нет описания'}
                      </Typography>
                      
                      {/* Счетчики задач */}
                      {isTasksLoading ? (
                        <Skeleton variant="rounded" height={32} width="100%" />
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 1,
                          gap: 0.8,
                          flexWrap: 'wrap'
                        }}>
                          <Badge 
                            badgeContent={boardTaskCount.total} 
                            color="primary"
                            showZero
                            sx={{
                              '& .MuiBadge-badge': { 
                                fontWeight: 600,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                              }
                            }}
                          >
                            <Chip
                              variant="outlined"
                              size="small"
                              icon={<DashboardIcon fontSize="small" />}
                              label="Всего"
                              sx={{ 
                                minWidth: 70, 
                                borderRadius: '10px',
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                borderColor: 'transparent'
                              }}
                            />
                          </Badge>
                          
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="К выполнению">
                              <Badge 
                                badgeContent={boardTaskCount.backlog} 
                                color="info"
                                showZero
                                sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', fontWeight: 600 } }}
                              >
                                <Chip
                                  variant="outlined"
                                  size="small"
                                  icon={<BacklogIcon fontSize="small" />}
                                  sx={{ 
                                    minWidth: 16,
                                    backgroundColor: alpha(theme.palette.info.main, 0.08),
                                    borderColor: 'transparent',
                                    borderRadius: '10px',
                                  }}
                                />
                              </Badge>
                            </Tooltip>
                            
                            <Tooltip title="В работе">
                              <Badge 
                                badgeContent={boardTaskCount.inProgress} 
                                color="warning"
                                showZero
                                sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', fontWeight: 600 } }}
                              >
                                <Chip
                                  variant="outlined"
                                  size="small"
                                  icon={<InProgressIcon fontSize="small" />}
                                  sx={{ 
                                    minWidth: 16,
                                    backgroundColor: alpha(theme.palette.warning.main, 0.08),
                                    borderColor: 'transparent',
                                    borderRadius: '10px',
                                  }}
                                />
                              </Badge>
                            </Tooltip>
                            
                            <Tooltip title="Готово">
                              <Badge 
                                badgeContent={boardTaskCount.done} 
                                color="success"
                                showZero
                                sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', fontWeight: 600 } }}
                              >
                                <Chip
                                  variant="outlined"
                                  size="small"
                                  icon={<DoneIcon fontSize="small" />}
                                  sx={{ 
                                    minWidth: 16,
                                    backgroundColor: alpha(theme.palette.success.main, 0.08),
                                    borderColor: 'transparent',
                                    borderRadius: '10px',
                                  }}
                                />
                              </Badge>
                            </Tooltip>
                          </Box>
                          
                          {board.assignee && (
                            <Tooltip title={`Владелец: ${board.assignee}`}>
                              <Avatar
                                sx={{ 
                                  width: 24, 
                                  height: 24,
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  bgcolor: board.color || theme.palette.primary.main,
                                  color: '#fff',
                                  ml: 'auto',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                                }}
                              >
                                {board.assignee[0] || '?'}
                              </Avatar>
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    </CardContent>
                    
                    <Divider light sx={{ opacity: 0.6 }} />
                    
                    <CardActions className="board-card-actions" sx={{ 
                      transition: 'all 0.3s ease',
                      opacity: 0.9,
                      transform: 'translateY(4px)',
                      py: 1.5
                    }}>
                      <Button 
                        size="small"
                        endIcon={
                          <ArrowIcon 
                            className="board-card-arrow" 
                            sx={{ 
                              transition: theme.transitions.create(['transform', 'opacity'], {
                                duration: theme.transitions.duration.shorter
                              }),
                              opacity: 0.7
                            }} 
                          />
                        }
                        sx={{ 
                          fontWeight: 500, 
                          color: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08)
                          }
                        }}
                      >
                        Перейти к доске
                      </Button>
                      <IconButton 
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          const selectedBoard = boards?.find(b => b.id === board.id);
                          if (selectedBoard) {
                            handleMoveToTrash(selectedBoard);
                          }
                        }}
                        sx={{ 
                          ml: 'auto',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            transform: 'rotate(5deg)'
                          },
                          transition: 'transform 0.2s'
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </BoardCard>
                </motion.div>
              );
            })}
          </Box>
        </AnimatePresence>
      </GlassContainer>
      
      {/* Модальное окно для создания доски */}
      <BoardModal 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
      />

      {/* Контекстное меню для доски - стилизованное */}
      <Menu
        open={boardContextMenu.open}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          boardContextMenu.open
            ? { top: boardContextMenu.position.top, left: boardContextMenu.position.left }
            : undefined
        }
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            borderRadius: 2,
            minWidth: 200,
            backdropFilter: 'blur(10px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            backgroundImage: 'none',
            boxShadow: `0 8px 25px ${alpha(theme.palette.common.black, 0.15)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: 'hidden',
            '& .MuiListItem-root': {
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1)
              }
            }
          }
        }}
        TransitionComponent={Grow}
        transitionDuration={200}
      >
        <MenuItem onClick={() => {
          handleBoardClick(boardContextMenu.boardId);
          handleCloseContextMenu();
        }}>
          <ListItemIcon>
            <ArrowIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Открыть доску" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          const selectedBoard = boards?.find(b => b.id === boardContextMenu.boardId);
          if (selectedBoard) {
            handleMoveToTrash(selectedBoard);
          }
        }}
        sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Переместить в корзину" />
        </MenuItem>
      </Menu>

      {/* Диалог подтверждения действий - стилизованный */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{ 
          sx: { 
            borderRadius: theme.shape.borderRadius * 2,
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: confirmDialogType === 'trash' 
                ? `linear-gradient(to right, ${theme.palette.warning.main}, ${theme.palette.warning.light})`
                : confirmDialogType === 'restore'
                  ? `linear-gradient(to right, ${theme.palette.success.main}, ${theme.palette.success.light})`
                  : `linear-gradient(to right, ${theme.palette.error.main}, ${theme.palette.error.light})`,
            }
          }
        }}
        TransitionComponent={Grow}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pt: 4 }}>
          {confirmDialogType === 'trash' && 'Переместить в корзину?'}
          {confirmDialogType === 'restore' && 'Восстановить доску?'}
          {confirmDialogType === 'delete' && 'Удалить навсегда?'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {confirmDialogType === 'trash' && 
              `Вы уверены, что хотите переместить доску "${targetBoard?.name}" в корзину?`}
            {confirmDialogType === 'restore' && 
              `Вы уверены, что хотите восстановить доску "${targetBoard?.name}"?`}
            {confirmDialogType === 'delete' && (
              <>
                Вы уверены, что хотите полностью удалить доску "{targetBoard?.name}"?
                <Box 
                  sx={{ 
                    backgroundColor: alpha(theme.palette.error.main, 0.1), 
                    p: 1.5, 
                    mt: 2, 
                    borderRadius: 1.5,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                  }}
                >
                  <Typography variant="body2" color="error.dark" fontWeight={500}>
                    Это действие нельзя отменить.
                  </Typography>
                </Box>
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => setConfirmDialogOpen(false)} 
              variant="outlined" 
              sx={{ borderRadius: theme.shape.borderRadius * 1.5 }}
            >
              Отмена
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handleConfirmAction}
              variant="contained"
              color={
                confirmDialogType === 'delete' ? 'error' : 
                confirmDialogType === 'restore' ? 'success' : 'warning'
              }
              sx={{ 
                borderRadius: theme.shape.borderRadius * 1.5,
                background: confirmDialogType === 'delete'
                  ? `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`
                  : confirmDialogType === 'restore'
                    ? `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
                    : `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                boxShadow: `0 4px 12px ${alpha(
                  confirmDialogType === 'delete' 
                    ? theme.palette.error.main 
                    : confirmDialogType === 'restore'
                      ? theme.palette.success.main
                      : theme.palette.warning.main, 
                  0.3
                )}`,
              }}
            >
              {confirmDialogType === 'trash' && 'Переместить'}
              {confirmDialogType === 'restore' && 'Восстановить'}
              {confirmDialogType === 'delete' && 'Удалить навсегда'}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>

      {/* Модальное окно корзины - стилизованное */}
      <Dialog
        open={trashModalOpen}
        onClose={() => setTrashModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: theme.shape.borderRadius * 2,
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)', 
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
            }
          }
        }}
        TransitionComponent={Grow}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          pt: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <DeleteIcon color="secondary" />
          <Box>
            Корзина удаленных досок 
            <Badge 
              badgeContent={deletedBoards.length} 
              color="secondary" 
              sx={{ ml: 1, '& .MuiBadge-badge': { fontWeight: 600 } }} 
              max={999}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <AnimatePresence>
            {deletedBoards.length > 0 ? (
              <Box sx={{ mt: 1, maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
                {deletedBoards.map((board, index) => (
                  <motion.div 
                    key={board.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: theme.shape.borderRadius * 1.5,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        backdropFilter: 'blur(5px)',
                        backgroundColor: alpha(theme.palette.background.paper, 0.7),
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                          backgroundColor: alpha(theme.palette.background.paper, 0.85),
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: 0,
                          width: '4px',
                          background: board.color || theme.palette.secondary.main,
                          borderTopLeftRadius: theme.shape.borderRadius * 1.5,
                          borderBottomLeftRadius: theme.shape.borderRadius * 1.5,
                        }
                      }}
                    >
                      <Box sx={{ pl: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600} mb={0.5}>
                          {board.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {board.team && (
                            <Chip
                              size="small"
                              label={board.team}
                              variant="outlined"
                              icon={<TeamIcon fontSize="small" />}
                              sx={{ 
                                borderRadius: '8px',
                                backgroundColor: alpha(theme.palette.background.paper, 0.5)
                              }}
                            />
                          )}
                          {board.assignee && (
                            <Tooltip title={`Владелец: ${board.assignee}`}>
                              <Avatar
                                sx={{ 
                                  width: 24, 
                                  height: 24,
                                  fontSize: '0.75rem',
                                  bgcolor: board.color || theme.palette.secondary.main,
                                  fontWeight: 600
                                }}
                              >
                                {board.assignee[0] || '?'}
                              </Avatar>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant="outlined"
                            color="secondary"
                            size="small"
                            startIcon={<RestoreIcon />}
                            onClick={() => handleRestoreBoard(board)}
                            sx={{
                              borderRadius: theme.shape.borderRadius * 1.5,
                              borderColor: theme.palette.secondary.main,
                              borderWidth: 2,
                            }}
                          >
                            Восстановить
                          </Button>
                        </motion.div>
                      </Box>
                    </Paper>
                  </motion.div>
                ))}
              </Box>
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  py: 8,
                  opacity: 0.8
                }}
              >
                <motion.div
                  animate={{ 
                    opacity: [0.5, 0.8, 0.5],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 3
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.5), mb: 2 }} />
                </motion.div>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Корзина пуста
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Здесь появятся удаленные доски
                </Typography>
              </Box>
            )}
          </AnimatePresence>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
          {deletedBoards.length > 0 && (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button 
                color="error" 
                variant="outlined"
                onClick={handleClearTrash}
                sx={{ 
                  borderRadius: theme.shape.borderRadius * 1.5,
                  borderWidth: 2,
                  borderColor: theme.palette.error.main,
                }}
              >
                Очистить корзину
              </Button>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button 
              onClick={() => setTrashModalOpen(false)}
              variant="contained"
              sx={{ 
                borderRadius: theme.shape.borderRadius * 1.5,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                px: 3
              }}
            >
              Закрыть
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </ErrorBoundary>
  );
};

export default BoardsPage;
