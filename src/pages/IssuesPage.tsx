import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CircularProgress, Alert, Container, Typography, Button, Box, 
  Paper, Grow, Fade, Zoom, useTheme, alpha, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  styled, useMediaQuery, IconButton, Tooltip,
  ToggleButtonGroup, ToggleButton, Badge
} from '@mui/material';
import { useIssues } from '@/shared/hooks/useIssues';
import { useTasks } from '@/shared/hooks/useTasks'; 
import { useUpdateTask } from '@/shared/hooks/useUpdateTask';
import { useUpdateTaskStatus } from '@/shared/hooks/useUpdateTaskStatus'; 
import { useUpdateIssuePriority } from '@/shared/hooks/useUpdateIssuePriority'; 
import { useBoards } from '@/shared/hooks/useBoards';
import { useDeleteTask } from '@/shared/hooks/useDeleteTask';
import { useTaskStatuses } from '@/shared/hooks/useTaskStatuses';
import IssuesTable from '@/components/IssuesTable';
import IssueFilters from '@/components/IssueFilters';
import AddIcon from '@mui/icons-material/Add';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CompressIcon from '@mui/icons-material/Compress';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import TableRowsIcon from '@mui/icons-material/TableRows';
import CreateIssueModal from '@/components/CreateIssueModal';
import IssueModal from '@/components/IssueModal';
import { Issue } from '@/types/issue';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

// Типы режимов отображения
type ViewMode = 'default' | 'compact' | 'superCompact';

// Стилизованные компоненты для улучшения дизайна
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  backdropFilter: 'blur(10px)',
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.6)})` 
    : `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'transform 0.3s, box-shadow 0.3s',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    zIndex: 1,
  },
}));

// Стилизованный переключатель режимов отображения
const ViewModeToggle = styled(ToggleButtonGroup)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.08)}`,
  overflow: 'hidden',
  '& .MuiToggleButton-root': {
    border: 'none',
    transition: 'all 0.2s ease',
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
      }
    }
  }
}));

const TechGradientButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(1, 3),
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.primary.contrastText,
  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
  },
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
  zIndex: -1,
  pointerEvents: 'none',
}));

/**
 * Страница всех задач с возможностью фильтрации, создания и редактирования задач,
 * а также инлайн-редактирования статуса и приоритета с улучшенным технологичным дизайном
 */
export default function IssuesPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Реф для отслеживания прокрутки
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: containerRef });
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.7]);
  const headerY = useTransform(scrollY, [0, 100], [0, -15]);
  
  // Состояние для режима отображения задач
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Получаем сохраненное значение из localStorage или используем 'default' по умолчанию
    const savedViewMode = localStorage.getItem('issuesViewMode');
    return (savedViewMode as ViewMode) || 'default';
  });

  // Сохраняем выбор режима отображения в localStorage
  useEffect(() => {
    localStorage.setItem('issuesViewMode', viewMode);
  }, [viewMode]);

  // Количество задач, которые помещаются на экран в компактном режиме
  const tasksPerPage = useMemo(() => {
    if (viewMode === 'superCompact') return 50; // Очень компактный режим
    if (viewMode === 'compact') return 25;      // Компактный режим
    return 15;                                  // Стандартный режим
  }, [viewMode]);

  // Хуки для получения и обработки данных
  const { data: tasks, isLoading: issuesLoading, isError, error, refetch } = useTasks(); // Используем useTasks вместо useIssues
  const { data: boards, isLoading: boardsLoading } = useBoards();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: updateStatus } = useUpdateTaskStatus(); // Хук для обновления статуса задачи
  const { mutate: updatePriority } = useUpdateIssuePriority(); // Хук для обновления приоритета задачи
  const { 
    statuses, 
    isLoading: statusesLoading, 
    getStatusLabel, 
    getStatusColor 
  } = useTaskStatuses(); // Добавляем хук статусов задач
  
  // Состояния модальных окон
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Issue | null>(null);
  
  // Состояние для хранения ID виртуально удаленных задач
  const [deletedTaskIds, setDeletedTaskIds] = useState<Set<string | number>>(new Set());
  
  // Эффект градиентной анимации для кнопок
  const [hoverStates, setHoverStates] = useState({
    restoreBtn: false,
    createBtn: false,
    trashBtn: false,
    viewBtn: false
  });

  // Состояние уведомлений
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
    open: boolean;
  }>({
    message: '',
    severity: 'info',
    open: false
  });

  // Загрузка виртуально удаленных задач из localStorage при монтировании компонента
  useEffect(() => {
    try {
      const savedDeletedTaskIds = localStorage.getItem('deletedTaskIds');
      if (savedDeletedTaskIds) {
        setDeletedTaskIds(new Set(JSON.parse(savedDeletedTaskIds)));
      }
    } catch (error) {
      console.error("Ошибка при загрузке удаленных задач:", error);
    }
  }, []);

  // Сохранение виртуально удаленных задач в localStorage при изменении
  useEffect(() => {
    if (deletedTaskIds.size > 0) {
      localStorage.setItem('deletedTaskIds', JSON.stringify(Array.from(deletedTaskIds)));
    } else {
      localStorage.removeItem('deletedTaskIds');
    }
  }, [deletedTaskIds]);

  // Функция отмены удаления задачи с анимацией
  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  // Состояние фильтров с сохранением в URL для удобства и возможности поделиться ссылкой
  const [filters, setFilters] = useState({
    status: '',
    boardId: '',
    title: '',
    assignee: '',
    priority: ''
  });

  // Инициализация фильтров из URL параметров при загрузке страницы
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get('status') || '';
    const boardParam = searchParams.get('boardId') || '';
    const titleParam = searchParams.get('title') || '';
    const assigneeParam = searchParams.get('assignee') || '';
    const priorityParam = searchParams.get('priority') || '';

    if (statusParam || boardParam || titleParam || assigneeParam || priorityParam) {
      setFilters({
        status: statusParam,
        boardId: boardParam,
        title: titleParam,
        assignee: assigneeParam,
        priority: priorityParam
      });
    }
  }, [location.search]);

  // Обновление URL при изменении фильтров для возможности поделиться ссылкой
  useEffect(() => {
    const searchParams = new URLSearchParams();
    if (filters.status) searchParams.set('status', filters.status);
    if (filters.boardId) searchParams.set('boardId', filters.boardId);
    if (filters.title) searchParams.set('title', filters.title);
    if (filters.assignee) searchParams.set('assignee', filters.assignee);
    if (filters.priority) searchParams.set('priority', filters.priority);

    // Обновляем URL только если есть фильтры, чтобы не засорять историю браузера
    if (searchParams.toString()) {
      navigate(`?${searchParams.toString()}`, { replace: true });
    } else if (location.search) {
      navigate('', { replace: true });
    }
  }, [filters, navigate, location.search]);

  // Показываем уведомление
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      message,
      severity,
      open: true
    });
  };

  // Закрываем уведомление
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Подготовка опций для фильтра по доскам
  const boardOptions = useMemo(() => {
    return boards?.map(b => ({
      id: String(b.id),
      name: b.name,
    })) || [];
  }, [boards]);

  // Фильтрация списка задач с учетом виртуально удаленных задач
  const filteredIssues = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(issue => {
      // Исключаем виртуально удаленные задачи
      if (deletedTaskIds.has(issue.id)) return false;
      
      // Фильтр по статусу задачи
      if (filters.status && issue.status !== filters.status) return false;
      
      // Фильтр по доске
      if (filters.boardId && String(issue.boardId) !== filters.boardId) return false;
      
      // Фильтр по приоритету
      if (filters.priority && issue.priority !== filters.priority) return false;
      
      // Фильтр по названию задачи (частичное совпадение, регистронезависимый)
      if (filters.title && filters.title.trim() !== '') {
        // Если заголовок задачи отсутствует или не содержит поисковый запрос, отфильтровываем задачу
        if (!issue.title || !issue.title.toLowerCase().includes(filters.title.toLowerCase())) {
          return false;
        }
      }
      
      // Фильтр по исполнителю (частичное совпадение в имени, регистронезависимый)
      if (filters.assignee && filters.assignee.trim() !== '') {
        if (!issue.assignee || !issue.assignee.fullName.toLowerCase().includes(filters.assignee.toLowerCase())) {
          return false;
        }
      }
      
      return true;
    });
  }, [tasks, filters, deletedTaskIds]);

  // Обработчик выбора задачи для просмотра/редактирования
  const handleIssueSelect = (issue: Issue) => {
    setSelectedIssue(issue);
    setIssueModalOpen(true);
  };

  // Обработчик закрытия модального окна задачи
  const handleIssueModalClose = () => {
    setIssueModalOpen(false);
    setSelectedIssue(null);
  };

  // Обработчик сохранения изменений задачи
  const handleIssueSave = (updatedIssue: Issue) => {
    updateTask([updatedIssue.id, updatedIssue], {
      onSuccess: () => {
        showNotification('Задача успешно обновлена', 'success');
        setIssueModalOpen(false);
        setSelectedIssue(null);
        refetch();
      },
      onError: (error) => {
        console.error('Ошибка при обновлении задачи:', error);
        showNotification('Ошибка при обновлении задачи', 'error');
      }
    });
  };

  // Обработчик создания новой задачи
  const handleCreateIssue = (issue: Omit<Issue, 'id'>) => {
    // Создание задачи обрабатывается компонентом CreateIssueModal
    setCreateModalOpen(false);
    showNotification('Задача создана успешно', 'success');
    refetch();
  };

  // Обработчик виртуального удаления задачи
  const handleDeleteIssue = (issue: Issue) => {
    setDeleteTarget(issue);
    setDeleteConfirmOpen(true);
  };

  // Подтверждение виртуального удаления задачи
  const confirmDelete = () => {
    if (!deleteTarget) return;
    
    console.log(`Виртуальное удаление задачи с ID: ${deleteTarget.id}`);
    
    // Добавляем ID задачи в состояние удаленных задач
    setDeletedTaskIds(prev => new Set(prev).add(deleteTarget.id));
    
    showNotification('Задача успешно удалена (виртуально)', 'success');
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  // Восстановление удаленной задачи
  const handleRestoreTask = (id: number | string) => {
    setDeletedTaskIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    
    showNotification('Задача успешно восстановлена', 'success');
  };

  // Показать все удаленные задачи
  const [showDeletedTasks, setShowDeletedTasks] = useState(false);
  const [deletedTasksModalOpen, setDeletedTasksModalOpen] = useState(false);

  // Получение списка виртуально удаленных задач
  const deletedTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task => deletedTaskIds.has(task.id));
  }, [tasks, deletedTaskIds]);

  // Инлайн-изменение статуса в таблице
  const handleInlineStatusChange = (id: number | string, status: string) => {
    console.log(`Инлайн-изменение статуса: id=${id}, новый статус=${status}`);
    
    // Определяем русскоязычное название статуса для уведомления
    const statusText = status === 'Backlog' ? 'К выполнению' : 
                     status === 'InProgress' ? 'В работе' : 'Готово';
    
    // Используем правильный формат параметров для updateStatus
    updateStatus([id, status], {
      onSuccess: () => {
        console.log('Статус успешно обновлен');
        showNotification(`Статус задачи изменен на "${statusText}"`, 'success');
        refetch(); // Обновляем список задач
      },
      onError: (error) => {
        console.error('Ошибка при обновлении статуса:', error);
        showNotification('Ошибка при обновлении статуса', 'error');
        
        // После ошибки перезагружаем данные для синхронизации состояния
        setTimeout(() => refetch(), 1000);
      }
    });
  };

  // Инлайн-изменение приоритета в таблице
  const handleInlinePriorityChange = (id: number | string, priority: string) => {
    console.log(`Инлайн-изменение приоритета: id=${id}, новый приоритет=${priority}`);
    
    // Определяем русскоязычное название приоритета для уведомления
    const priorityText = priority === 'High' ? 'Высокий' : 
                         priority === 'Medium' ? 'Средний' : 
                         priority === 'Low' ? 'Низкий' : priority;
    
    // Используем правильный формат параметров для updatePriority
    updatePriority([id, priority], {
      onSuccess: () => {
        console.log('Приоритет успешно обновлен');
        showNotification(`Приоритет задачи изменен на "${priorityText}"`, 'success');
        refetch(); // Обновляем список задач
      },
      onError: (error) => {
        console.error('Ошибка при обновлении приоритета:', error);
        showNotification('Ошибка при обновлении приоритета', 'error');
        
        // После ошибки перезагружаем данные
        setTimeout(() => refetch(), 1000);
      }
    });
  };

  // Обработчик перехода на доску с текущей задачей
  const handleGoToBoard = (boardId: number, issueId?: number) => {
    if (boardId) {
      console.log(`Переход на доску ${boardId} с задачей ${issueId || 'без выделения задачи'}`);
      const url = `/board/${boardId}`;
      navigate(url + (issueId ? `?issueId=${issueId}` : ''));
    }
  };

  // Отображение загрузки
  if (issuesLoading || boardsLoading) {
    return (
      <Container sx={{ 
        mt: 4, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh'
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" mt={2} color="text.secondary">
          Загрузка задач...
        </Typography>
      </Container>
    );
  }

  // Отображение ошибки
  if (isError) {
    console.error("Error loading issues:", error);
    return (
      <Zoom in={true}>
        <Alert severity="error" sx={{ m: 4 }}>
          Ошибка загрузки задач. Проверьте консоль для деталей.
        </Alert>
      </Zoom>
    );
  }

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        mt: 4, 
        mb: 4, 
        position: 'relative',
        minHeight: 'calc(100vh - 80px)',
        overflowX: 'hidden'
      }} 
      ref={containerRef}
    >
      {/* Декоративные светящиеся круги для технологичного фона */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: -1 }}>
        <GlowingCircle 
          color={theme.palette.primary.main} 
          size={500} 
          opacity={0.15} 
          top={-200} 
          left={-100} 
        />
        <GlowingCircle 
          color={theme.palette.secondary.main} 
          size={400} 
          opacity={0.1} 
          top={300} 
          left={isMobile ? -200 : 700} 
        />
        <GlowingCircle 
          color={theme.palette.info.main} 
          size={300} 
          opacity={0.08} 
          top={500} 
          left={isMobile ? 150 : 300} 
        />
      </Box>

      <Fade in={true} timeout={800}>
        <Box>
          <motion.div style={{ opacity: headerOpacity, y: headerY }}>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center" 
              mb={4}
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                backdropFilter: 'blur(10px)',
                background: alpha(theme.palette.background.default, 0.7),
                borderRadius: 2,
                px: 2,
                py: 1,
                boxShadow: scrollY.get() > 20 ? 4 : 0
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <motion.div
                  animate={{
                    background: [
                      `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.info.main})`,
                      `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
                    ]
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                  style={{
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block',
                  }}
                >
                  <Typography 
                    variant="h4" 
                    component="h1"
                    sx={{ fontWeight: 700, mr: 2 }}
                  >
                    Задачи
                  </Typography>
                </motion.div>

                <Badge 
                  badgeContent={filteredIssues.length} 
                  color="primary"
                  max={999}
                  showZero
                  sx={{ ml: 1, '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <AutoAwesomeIcon 
                      sx={{ 
                        color: theme.palette.warning.main,
                        filter: 'drop-shadow(0 0 5px rgba(255,167,38,0.5))'
                      }} 
                    />
                  </motion.div>
                </Badge>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* Переключатель режимов отображения */}
                <ViewModeToggle
                  value={viewMode}
                  exclusive
                  onChange={(_, newMode) => {
                    if (newMode !== null) {
                      setViewMode(newMode);
                    }
                  }}
                  aria-label="Режим отображения задач"
                  size="small"
                >
                  <ToggleButton 
                    value="default" 
                    aria-label="Стандартный вид"
                    sx={{ px: 1.5, py: 0.7 }}
                  >
                    <Tooltip title="Стандартный вид">
                      <ViewAgendaIcon fontSize="small" />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton 
                    value="compact" 
                    aria-label="Компактный вид"
                    sx={{ px: 1.5, py: 0.7 }}
                  >
                    <Tooltip title="Компактный вид">
                      <ViewStreamIcon fontSize="small" />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton 
                    value="superCompact" 
                    aria-label="Очень компактный вид"
                    sx={{ px: 1.5, py: 0.7 }}
                  >
                    <Tooltip title="Очень компактный вид (Gmail)">
                      <TableRowsIcon fontSize="small" />
                    </Tooltip>
                  </ToggleButton>
                </ViewModeToggle>

                {deletedTaskIds.size > 0 && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      size="large"
                      onClick={() => setDeletedTasksModalOpen(true)}
                      startIcon={<DeleteOutlineIcon />}
                      onMouseEnter={() => setHoverStates(prev => ({ ...prev, trashBtn: true }))}
                      onMouseLeave={() => setHoverStates(prev => ({ ...prev, trashBtn: false }))}
                      sx={{
                        borderRadius: theme.shape.borderRadius * 1.5,
                        position: 'relative',
                        overflow: 'hidden',
                        borderWidth: 2,
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(to right, transparent 0%, ${alpha(theme.palette.secondary.main, 0.3)} 50%, transparent 100%)`,
                          transition: 'all 0.6s ease',
                          transform: hoverStates.trashBtn ? 'translateX(100%)' : 'translateX(0)'
                        }
                      }}
                    >
                      Корзина ({deletedTaskIds.size})
                    </Button>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TechGradientButton
                    size="large"
                    startIcon={<AddIcon />} 
                    onClick={() => setCreateModalOpen(true)}
                    onMouseEnter={() => setHoverStates(prev => ({ ...prev, createBtn: true }))}
                    onMouseLeave={() => setHoverStates(prev => ({ ...prev, createBtn: false }))}
                    sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(to right, transparent 0%, ${alpha('#fff', 0.3)} 50%, transparent 100%)`,
                        transition: 'all 0.6s ease',
                        transform: hoverStates.createBtn ? 'translateX(100%)' : 'translateX(0)'
                      }
                    }}
                  >
                    Создать задачу
                  </TechGradientButton>
                </motion.div>

                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                >
                  <IconButton
                    color="primary"
                    onClick={() => refetch()}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </motion.div>
              </Box>
            </Box>
          </motion.div>

          {/* Компонент с фильтрами */}
          <Grow in={true} timeout={500}>
            <StyledPaper sx={{ p: 3, mb: 4 }}>
              <Typography 
                variant="h6" 
                fontWeight={600} 
                mb={2}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: '4px',
                    height: '20px',
                    background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    borderRadius: '4px',
                    marginRight: '8px'
                  }
                }}
              >
                Фильтры
              </Typography>
              <IssueFilters 
                status={filters.status}
                boardId={filters.boardId}
                title={filters.title}
                assignee={filters.assignee}
                priority={filters.priority}
                boardOptions={boardOptions}
                onChange={setFilters}
              />
            </StyledPaper>
          </Grow>

          {/* Таблица с задачами */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StyledPaper sx={{ overflow: 'hidden' }}>
              <IssuesTable 
                issues={filteredIssues} 
                onIssueEdit={handleIssueSelect}
                onIssueDelete={handleDeleteIssue}
                isLoading={isDeleting}
                onStatusChange={handleInlineStatusChange}
                onPriorityChange={handleInlinePriorityChange}
                onBoardClick={handleGoToBoard}
                viewMode={viewMode} // Передаем режим отображения вместо флага compact
              />
            </StyledPaper>
          </motion.div>
          
          {/* Информация о количестве отображаемых задач */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Box mt={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    background: alpha(theme.palette.primary.main, 0.08),
                    padding: '6px 12px',
                    borderRadius: theme.shape.borderRadius,
                    fontWeight: 500
                  }}
                >
                  {filteredIssues.length > 0 
                    ? `Показано ${filteredIssues.length} ${
                        filteredIssues.length === 1 
                        ? 'задача' 
                        : filteredIssues.length < 5 
                          ? 'задачи' 
                          : 'задач'}`
                    : 'Нет задач, соответствующих фильтрам'}
                  {deletedTaskIds.size > 0 && ` (${deletedTaskIds.size} в корзине)`}
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  background: alpha(theme.palette.info.main, 0.08),
                  padding: '6px 12px',
                  borderRadius: theme.shape.borderRadius,
                  gap: 0.5
                }}>
                  <Tooltip title="Стандартный: 15, Компактный: 25, Очень компактный: 50">
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {viewMode === 'default' && 'Стандартный режим'}
                      {viewMode === 'compact' && 'Компактный режим'}
                      {viewMode === 'superCompact' && 'Gmail-режим'}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <ViewModeToggle
                  value={viewMode}
                  exclusive
                  onChange={(_, newMode) => {
                    if (newMode !== null) {
                      setViewMode(newMode);
                    }
                  }}
                  aria-label="Режим отображения задач"
                  size="small"
                >
                  <ToggleButton 
                    value="default" 
                    aria-label="Стандартный вид"
                    sx={{ px: 1.5, py: 0.7 }}
                  >
                    <Tooltip title="Стандартный вид">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ViewAgendaIcon fontSize="small" />
                        <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
                          Стандартный
                        </Typography>
                      </Box>
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton 
                    value="compact" 
                    aria-label="Компактный вид"
                    sx={{ px: 1.5, py: 0.7 }}
                  >
                    <Tooltip title="Компактный вид">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ViewStreamIcon fontSize="small" />
                        <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
                          Компактный
                        </Typography>
                      </Box>
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton 
                    value="superCompact" 
                    aria-label="Очень компактный вид"
                    sx={{ px: 1.5, py: 0.7 }}
                  >
                    <Tooltip title="Gmail-режим">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TableRowsIcon fontSize="small" />
                        <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
                          Gmail
                        </Typography>
                      </Box>
                    </Tooltip>
                  </ToggleButton>
                </ViewModeToggle>

                {filteredIssues.length < (tasks?.length || 0) - deletedTaskIds.size && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outlined"
                      size="small" 
                      onClick={() => setFilters({
                        status: '',
                        boardId: '',
                        title: '',
                        assignee: '',
                        priority: ''
                      })}
                      sx={{
                        borderRadius: theme.shape.borderRadius * 1.5,
                        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                        borderWidth: 2
                      }}
                    >
                      Сбросить фильтры
                    </Button>
                  </motion.div>
                )}
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Fade>

      {/* Модальное окно создания задачи */}
      <CreateIssueModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateIssue}
      />

      {/* Модальное окно просмотра/редактирования задачи */}
      <IssueModal
        open={issueModalOpen}
        issue={selectedIssue}
        onClose={handleIssueModalClose}
        onSave={handleIssueSave}
        onDelete={handleDeleteIssue}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={cancelDelete}
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius * 2,
            minWidth: '400px',
            background: theme.palette.mode === 'dark' 
              ? `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.8)})` 
              : `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.85)})`,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(to right, ${theme.palette.error.main}, ${theme.palette.error.light})`,
              zIndex: 1,
            },
          }
        }}
        TransitionComponent={Zoom}
      >
        <DialogTitle sx={{ fontWeight: 700, pt: 3 }}>Удалить задачу?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Вы уверены, что хотите удалить задачу "<strong>{deleteTarget?.title}</strong>"? 
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Задача будет перемещена в корзину, откуда её можно будет восстановить.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={cancelDelete} 
              variant="outlined" 
              sx={{ borderRadius: theme.shape.borderRadius * 1.5, px: 3 }}
            >
              Отмена
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              color="error" 
              onClick={confirmDelete}
              variant="contained"
              sx={{ 
                borderRadius: theme.shape.borderRadius * 1.5, 
                px: 3,
                background: `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                boxShadow: `0 4px 10px ${alpha(theme.palette.error.main, 0.3)}`
              }}
            >
              Удалить
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>

      {/* Модальное окно для просмотра удаленных задач */}
      <Dialog 
        open={deletedTasksModalOpen} 
        onClose={() => setDeletedTasksModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius * 2,
            background: theme.palette.mode === 'dark' 
              ? `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.8)})` 
              : `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.85)})`,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
              zIndex: 1,
            },
          }
        }}
        TransitionComponent={Zoom}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          pt: 3,
          display: 'flex',
          alignItems: 'center', 
          gap: 1 
        }}>
          <DeleteOutlineIcon color="secondary" /> Корзина удаленных задач ({deletedTasks.length})
        </DialogTitle>
        <DialogContent sx={{ minHeight: '200px' }}>
          <AnimatePresence>
            {deletedTasks.length > 0 ? (
              <Box sx={{ mt: 1 }}>
                {deletedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Paper 
                      elevation={2}
                      sx={{ 
                        p: 2.5, 
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: theme.shape.borderRadius * 1.5,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                        },
                        background: `linear-gradient(to right, ${alpha(theme.palette.background.paper, 1)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          bottom: 0,
                          width: '4px',
                          background: task.priority === 'High' 
                            ? theme.palette.error.main 
                            : task.priority === 'Medium'
                              ? theme.palette.warning.main
                              : theme.palette.success.main
                        }
                      }}
                    >
                      <Box sx={{ ml: 0.5 }}>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={600}
                          sx={{ mb: 0.5 }}
                        >
                          {task.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {task.description && task.description.slice(0, 100)}
                          {task.description && task.description.length > 100 ? '...' : ''}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Box 
                            sx={{ 
                              px: 1.5, 
                              py: 0.5, 
                              borderRadius: '10px', 
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            {task.status === 'Backlog' ? 'К выполнению' : 
                             task.status === 'InProgress' ? 'В работе' : 'Готово'}
                          </Box>
                          <Box 
                            sx={{ 
                              px: 1.5, 
                              py: 0.5, 
                              borderRadius: '10px', 
                              backgroundColor: 
                                task.priority === 'High' 
                                  ? alpha(theme.palette.error.main, 0.1) 
                                  : task.priority === 'Medium'
                                    ? alpha(theme.palette.warning.main, 0.1)
                                    : alpha(theme.palette.success.main, 0.1),
                              color: 
                                task.priority === 'High' 
                                  ? theme.palette.error.main 
                                  : task.priority === 'Medium'
                                    ? theme.palette.warning.main
                                    : theme.palette.success.main,
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            {task.priority === 'High' ? 'Высокий' : 
                             task.priority === 'Medium' ? 'Средний' : 'Низкий'}
                          </Box>
                        </Box>
                      </Box>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outlined" 
                          size="medium"
                          color="secondary"
                          startIcon={<RestoreFromTrashIcon />}
                          onClick={() => handleRestoreTask(task.id)}
                          onMouseEnter={() => setHoverStates(prev => ({ ...prev, restoreBtn: true }))}
                          onMouseLeave={() => setHoverStates(prev => ({ ...prev, restoreBtn: false }))}
                          sx={{
                            borderRadius: theme.shape.borderRadius * 1.5,
                            borderColor: theme.palette.secondary.main,
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
                              background: `linear-gradient(to right, transparent 0%, ${alpha(theme.palette.secondary.main, 0.3)} 50%, transparent 100%)`,
                              transition: 'all 0.6s ease',
                              transform: hoverStates.restoreBtn ? 'translateX(100%)' : 'translateX(0)'
                            }
                          }}
                        >
                          Восстановить
                        </Button>
                      </motion.div>
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
                  py: 6
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, type: 'spring' }}
                >
                  <DeleteOutlineIcon 
                    sx={{ 
                      fontSize: 60, 
                      color: alpha(theme.palette.text.secondary, 0.3),
                      mb: 2
                    }} 
                  />
                </motion.div>
                <Typography color="text.secondary" variant="body1" fontWeight={500}>
                  Корзина пуста
                </Typography>
                <Typography 
                  color="text.disabled" 
                  variant="body2" 
                  sx={{ mt: 0.5, maxWidth: 400, textAlign: 'center' }}
                >
                  Здесь будут отображаться удаленные задачи, которые можно восстановить
                </Typography>
              </Box>
            )}
          </AnimatePresence>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
          {deletedTasks.length > 0 && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                color="error" 
                variant="outlined"
                onClick={() => {
                  setDeletedTaskIds(new Set());
                  setDeletedTasksModalOpen(false);
                  showNotification('Корзина очищена', 'info');
                }}
                sx={{ 
                  borderRadius: theme.shape.borderRadius * 1.5,
                  borderWidth: 2
                }}
              >
                Очистить корзину
              </Button>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => setDeletedTasksModalOpen(false)}
              variant="contained"
              sx={{ 
                borderRadius: theme.shape.borderRadius * 1.5,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                px: 3
              }}
            >
              Закрыть
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>

      {/* Глобальные уведомления */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Zoom}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: theme.shape.borderRadius * 1.5,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
