import React, { useState, useEffect, useMemo } from 'react'
import { 
  Container, Typography, CircularProgress, Alert, Snackbar, Box, Slide, Paper, alpha, useTheme, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Backdrop, Grow, Chip, Badge
} from '@mui/material'
import { useTasks } from '@/shared/hooks/useTasks'
import { useOptimisticTaskOperations } from '@/shared/hooks/useOptimisticTaskOperations'
import KanbanBoard from '@/components/KanbanBoard'
import TaskModal from '@/components/TaskModal'
import { motion, AnimatePresence } from 'framer-motion'
import AddIcon from '@mui/icons-material/Add'
import FilterListIcon from '@mui/icons-material/FilterList'
import DeleteIcon from '@mui/icons-material/Delete'
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash'
import SpeedIcon from '@mui/icons-material/Speed'
import UpgradeIcon from '@mui/icons-material/Upgrade'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import type { Issue } from '@/types/issue'
import { styled } from '@mui/material/styles'

// Стилизованные компоненты для улучшенного дизайна
const GlassContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  overflow: 'hidden',
  minHeight: 'calc(100vh - 64px)',
  position: 'relative',
}))

const GlassPaper = styled(Paper)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    zIndex: 1
  }
}))

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.primary.contrastText,
  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
  transition: 'all 0.3s ease',
  borderRadius: theme.shape.borderRadius * 1.5,
  '&:hover': {
    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
    transform: 'translateY(-2px)'
  }
}))

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
}))

const StyledTaskCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 28px ${alpha(theme.palette.common.black, 0.12)}`,
  }
}))

const FloatingParticle = styled(motion.div)(({ theme, size = 6, color = '#4fc3f7' }) => ({
  position: 'absolute',
  width: `${size}px`,
  height: `${size}px`,
  background: color,
  borderRadius: '50%',
  filter: 'blur(1px)',
  zIndex: -1,
}))

/**
 * Страница с канбан-доской для визуализации процесса работы
 * Поддерживает drag-and-drop для перемещения задач между статусами
 * и контекстное меню для быстрого изменения статуса и приоритета задач
 * С оптимистичным UI, анимациями и современным дизайном
 */
export default function KanbanPage() {
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = useTasks()
  
  // Состояние для хранения ID виртуально удаленных задач
  const [deletedTaskIds, setDeletedTaskIds] = useState<Set<string | number>>(new Set());
  
  // Состояние для эффектов анимаций
  const [particles, setParticles] = useState<Array<{
    x: number, 
    y: number, 
    size: number, 
    color: string,
    initialX: number,
    initialY: number,
  }>>([]);
  
  // Создаем частицы для фона
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

  // Загрузка виртуально удаленных задач из localStorage при монтировании компонента
  useEffect(() => {
    try {
      const savedDeletedTaskIds = localStorage.getItem('deletedTaskIdsKanban');
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
      localStorage.setItem('deletedTaskIdsKanban', JSON.stringify(Array.from(deletedTaskIds)));
    } else {
      localStorage.removeItem('deletedTaskIdsKanban');
    }
  }, [deletedTaskIds]);
  
  // Отфильтрованные задачи (без виртуально удаленных)
  const filteredTasks = useMemo(() => {
    if (!data) return [];
    return data.filter(task => !deletedTaskIds.has(task.id));
  }, [data, deletedTaskIds]);
  
  // Виртуально удаленные задачи
  const deletedTasks = useMemo(() => {
    if (!data) return [];
    return data.filter(task => deletedTaskIds.has(task.id));
  }, [data, deletedTaskIds]);
  
  // Состояние для модального окна "Корзина"
  const [trashModalOpen, setTrashModalOpen] = useState(false);
  
  // Используем хук для оптимистичных операций
  const {
    deleteTask,
    updateTaskStatus,
    updateTaskPriority
  } = useOptimisticTaskOperations();
  
  const [selectedTask, setSelectedTask] = useState<Issue | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hoverState, setHoverState] = useState({
    addButton: false,
    refreshButton: false,
    trashButton: false,
  });

  // Периодически обновляем данные для синхронизации с сервером
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 30000); // Каждые 30 секунд

    return () => clearInterval(intervalId);
  }, [refetch]);

  /**
   * Обработчик изменения статуса и/или приоритета задачи
   * С улучшенной обработкой ошибок и анимациями
   */
  const handleStatusChange = (issueId: number | string, newStatus: string, newPriority?: string) => {
    // Сброс ошибок перед обновлением статуса
    setErrorMessage(null);
    
    // Определяем, меняется ли только приоритет
    const isPriorityChangeOnly = !!newPriority && !newStatus; 
    
    // Обработка изменения приоритета (если указан)
    if (newPriority) {
      updateTaskPriority.mutate(
        [issueId, newPriority], 
        {
          onSuccess: () => {
            // Показываем правильное уведомление о смене приоритета
            const priorityText = newPriority === 'High' ? 'Высокий' : 
                               newPriority === 'Medium' ? 'Средний' : 'Низкий';
            setSuccessMessage(`Приоритет задачи изменен на "${priorityText}"`);
            setTimeout(() => setSuccessMessage(null), 3000);
          },
          onError: (error) => {
            console.error('Ошибка при обновлении приоритета:', error);
            setErrorMessage('Ошибка при обновлении приоритета задачи');
          }
        }
      );
    }
    
    // Если передан новый статус, обновляем его
    if (newStatus) {
      updateTaskStatus.mutate(
        [issueId, newStatus],
        {
          onSuccess: () => {
            // Показываем уведомление о смене статуса только если не было уже уведомления о приоритете
            if (!newPriority || isPriorityChangeOnly) {
              const statusText = 
                newStatus === 'Backlog' ? 'К выполнению' : 
                newStatus === 'InProgress' ? 'В работе' : 'Готово';
              setSuccessMessage(`Статус задачи изменен на "${statusText}"`);
              setTimeout(() => setSuccessMessage(null), 3000);
            }
          },
          onError: (error: any) => {
            console.error('Ошибка при обновлении статуса задачи:', error);
            setErrorMessage(error?.message || 'Ошибка при обновлении статуса задачи');
            
            // После ошибки перезагружаем данные
            setTimeout(() => refetch(), 1000);
          }
        }
      );
    }
  };

  // Состояния для диалогов подтверждения
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [confirmationDialogType, setConfirmationDialogType] = useState<'move-to-trash' | 'restore' | 'delete-permanent' | 'clear-trash'>('move-to-trash');
  const [taskToConfirm, setTaskToConfirm] = useState<Issue | null | {id: number | string, title?: string}>(null);

  /**
   * Показать диалог подтверждения с указанным типом и данными задачи
   */
  const showConfirmationDialog = (type: 'move-to-trash' | 'restore' | 'delete-permanent' | 'clear-trash', task?: Issue | {id: number | string, title?: string}) => {
    setConfirmationDialogType(type);
    setTaskToConfirm(task || null);
    setConfirmationDialogOpen(true);
  };

  /**
   * Обработчик подтверждения действия
   */
  const handleConfirmAction = () => {
    switch (confirmationDialogType) {
      case 'move-to-trash':
        if (taskToConfirm) {
          moveTaskToTrash(taskToConfirm.id);
        }
        break;
      case 'restore':
        if (taskToConfirm) {
          restoreTaskFromTrash(taskToConfirm.id);
        }
        break;
      case 'delete-permanent':
        if (taskToConfirm) {
          deletePermanently(taskToConfirm.id);
        }
        break;
      case 'clear-trash':
        clearTrash();
        break;
    }
    setConfirmationDialogOpen(false);
    setTaskToConfirm(null);
  };

  /**
   * Обработка закрытия диалога подтверждения без выполнения действия
   */
  const handleCancelConfirmation = () => {
    setConfirmationDialogOpen(false);
    setTaskToConfirm(null);
  };

  /**
   * Обработчик обновления задачи с анимациями
   */
  const handleUpdateTask = (updatedTask: Issue) => {
    // Закрываем модальное окно
    setSelectedTask(null);
    
    // Показываем уведомление об успешном обновлении
    setSuccessMessage('Задача успешно обновлена');
    setTimeout(() => setSuccessMessage(null), 3000);
    
    // Обновляем данные для отображения изменений
    setTimeout(() => refetch(), 300);
  };
  
  /**
   * Обработчик создания новой задачи
   */
  const handleCreateTask = () => {
    setIsCreateModalOpen(true);
  };
  
  /**
   * Обработчик сохранения новой задачи
   */
  const handleNewTaskSaved = () => {
    setIsCreateModalOpen(false);
    setSuccessMessage('Задача успешно создана');
    setTimeout(() => setSuccessMessage(null), 3000);
    
    // Обновляем данные для отображения новой задачи
    setTimeout(() => refetch(), 500);
  };

  /**
   * Запрос на удаление задачи (перемещение в корзину)
   */
  const handleTaskDelete = (issueId: number | string) => {
    // Находим задачу по ID для отображения информации в диалоге
    const taskToDelete = data?.find(task => task.id === issueId);
    
    if (taskToDelete) {
      showConfirmationDialog('move-to-trash', taskToDelete);
    } else {
      // Если задача не найдена, все равно показываем диалог
      showConfirmationDialog('move-to-trash', { id: issueId });
    }
  };

  /**
   * Фактическое виртуальное удаление задачи (перемещение в корзину)
   */
  const moveTaskToTrash = (issueId: number | string) => {
    // Добавляем ID задачи в состояние удаленных задач
    setDeletedTaskIds(prev => new Set(prev).add(issueId));
    
    setDeleteSuccess(true);
    setTimeout(() => setDeleteSuccess(false), 100);
    setSuccessMessage(`Задача #${issueId} перемещена в корзину`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  /**
   * Запрос на восстановление задачи из корзины
   */
  const handleRestoreTask = (id: number | string) => {
    // Находим задачу по ID
    const taskToRestore = deletedTasks.find(task => task.id === id);
    
    if (taskToRestore) {
      showConfirmationDialog('restore', taskToRestore);
    } else {
      showConfirmationDialog('restore', { id });
    }
  };
  
  /**
   * Фактическое восстановление задачи из корзины
   */
  const restoreTaskFromTrash = (id: number | string) => {
    setDeletedTaskIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    
    setSuccessMessage('Задача успешно восстановлена');
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  /**
   * Запрос на полное удаление задачи
   */
  const handlePermanentDeleteTask = (issueId: number | string) => {
    // Находим задачу по ID
    const taskToDelete = deletedTasks.find(task => task.id === issueId);
    
    if (taskToDelete) {
      showConfirmationDialog('delete-permanent', taskToDelete);
    } else {
      showConfirmationDialog('delete-permanent', { id: issueId });
    }
  };
  
  /**
   * Фактическое полное удаление задачи через API
   */
  const deletePermanently = (issueId: number | string) => {
    deleteTask.mutate(issueId, {
      onSuccess: () => {
        // Удаляем задачу из списка виртуально удаленных
        setDeletedTaskIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(issueId);
          return newSet;
        });
        
        setSuccessMessage(`Задача #${issueId} удалена навсегда`);
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: () => {
        setErrorMessage(`Ошибка при удалении задачи #${issueId}`);
        setTimeout(() => setErrorMessage(null), 4000);
        
        // После ошибки перезагружаем данные
        setTimeout(() => refetch(), 1000);
      }
    });
  };
  
  /**
   * Запрос на очистку корзины
   */
  const handleClearTrash = () => {
    showConfirmationDialog('clear-trash');
  };
  
  /**
   * Фактическая очистка корзины
   */
  const clearTrash = () => {
    setDeletedTaskIds(new Set());
    setTrashModalOpen(false);
    setSuccessMessage('Корзина очищена');
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  /**
   * Обработчик принудительного обновления данных
   */
  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch().finally(() => {
      setIsRefreshing(false);
      setSuccessMessage('Данные обновлены');
      setTimeout(() => setSuccessMessage(null), 1500);
    });
  };

  // Отображение состояния загрузки
  if (isLoading) {
    return (
      <GlassContainer maxWidth="lg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '60vh',
            gap: 3
          }}>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <AutoAwesomeMotionIcon 
                sx={{ 
                  fontSize: 60, 
                  color: theme.palette.primary.main,
                  filter: `drop-shadow(0 0 8px ${alpha(theme.palette.primary.main, 0.5)})`
                }} 
              />
            </motion.div>
            
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              Загрузка вашей канбан-доски...
            </Typography>
            
            <CircularProgress size={40} thickness={4} sx={{ mt: 1 }} />
          </Box>
        </motion.div>
      </GlassContainer>
    );
  }

  // Отображение состояния ошибки
  if (isError) {
    return (
      <GlassContainer maxWidth="lg">
        <Box sx={{ position: 'relative' }}>
          <GlowingCircle color={theme.palette.error.main} size={400} opacity={0.1} top={-100} left={-150} />
          <GlowingCircle color={theme.palette.error.dark} size={300} opacity={0.08} top={200} left={400} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <GlassPaper sx={{ 
              p: 4, 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3
            }}>
              <Typography variant="h4" align="center" sx={{ fontWeight: 600, mb: 2 }}>
                Произошла ошибка загрузки
              </Typography>
              
              <Alert 
                severity="error" 
                variant="filled" 
                icon={<motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <AutoAwesomeIcon />
                </motion.div>}
                sx={{ 
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
                }}
                action={
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      color="inherit" 
                      onClick={() => refetch()}
                      sx={{ fontWeight: 600 }}
                    >
                      Повторить
                    </Button>
                  </motion.div>
                }
              >
                Ошибка загрузки задач. Проверьте доступность API или сетевое подключение.
              </Alert>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{ marginTop: '16px' }}
              >
                <GradientButton 
                  onClick={() => refetch()}
                  startIcon={<UpgradeIcon />}
                  size="large"
                >
                  Обновить данные
                </GradientButton>
              </motion.div>
            </GlassPaper>
          </motion.div>
        </Box>
      </GlassContainer>
    );
  }

  return (
    <GlassContainer 
      maxWidth="xl"
    >
      {/* Декоративный технологичный фон */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: -1 }}>
        <GlowingCircle color={theme.palette.primary.main} size={500} opacity={0.08} top={-100} left={-100} />
        <GlowingCircle color={theme.palette.secondary.main} size={400} opacity={0.06} top={300} left={800} />
        <GlowingCircle color={theme.palette.info.main} size={350} opacity={0.05} top={500} left={300} />
        
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
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            top: '10%',
            right: '5%',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <Box
          component={motion.div}
          sx={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
            bottom: '10%',
            left: '5%',
          }}
          animate={{
            rotate: -360,
          }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        />
      </Box>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          mb: 4,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <AutoAwesomeIcon 
                  sx={{ 
                    fontSize: 30,
                    color: theme.palette.warning.main,
                    filter: `drop-shadow(0 0 5px ${alpha(theme.palette.warning.main, 0.5)})`,
                  }} 
                />
              </motion.div>
              
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: -0.5,
                }}
              >
                Канбан-доска
              </Typography>
            </Box>
            
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 0.5,
                gap: 0.5
              }}
            >
              <KeyboardDoubleArrowRightIcon fontSize="small" color="action" />
              Управляйте задачами с помощью drag-and-drop или контекстного меню
              {deletedTaskIds.size > 0 && (
                <Chip 
                  label={`В корзине: ${deletedTaskIds.size}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ ml: 1, borderRadius: 1 }}
                />
              )}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {deletedTaskIds.size > 0 && (
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setHoverState(prev => ({ ...prev, trashButton: true }))}
                onHoverEnd={() => setHoverState(prev => ({ ...prev, trashButton: false }))}
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
                      transform: hoverState.trashButton ? 'translateX(100%)' : 'translateX(0)'
                    }
                  }}
                >
                  Корзина ({deletedTaskIds.size})
                </Button>
              </motion.div>
            )}
            
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoverState(prev => ({ ...prev, refreshButton: true }))}
              onHoverEnd={() => setHoverState(prev => ({ ...prev, refreshButton: false }))}
            >
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleRefresh}
                disabled={isRefreshing}
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
                    background: `linear-gradient(to right, transparent 0%, ${alpha(theme.palette.primary.main, 0.2)} 50%, transparent 100%)`,
                    transition: 'all 0.6s ease',
                    transform: hoverState.refreshButton ? 'translateX(100%)' : 'translateX(0)'
                  }
                }}
              >
                {isRefreshing ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Обновление...
                  </>
                ) : (
                  'Обновить'
                )}
              </Button>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoverState(prev => ({ ...prev, addButton: true }))}
              onHoverEnd={() => setHoverState(prev => ({ ...prev, addButton: false }))}
            >
              <GradientButton
                startIcon={<AddIcon />}
                onClick={handleCreateTask}
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
                    transform: hoverState.addButton ? 'translateX(100%)' : 'translateX(0)'
                  }
                }}
              >
                Создать задачу
              </GradientButton>
            </motion.div>
          </Box>
        </Box>
      </motion.div>
      
      {/* Полоса состояния операций */}
      <Box sx={{ position: 'relative', mb: 4 }}>
        {(updateTaskStatus.isPending || updateTaskPriority.isPending || deleteTask.isPending) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Paper 
              elevation={0} 
              sx={{ 
                padding: 1.5,
                paddingLeft: 3,
                borderRadius: theme.shape.borderRadius * 1.5,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                backdropFilter: 'blur(10px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <SpeedIcon color="primary" />
              </motion.div>
              <Typography variant="body2" color="primary" fontWeight={500}>
                {deleteTask.isPending ? 'Удаление задачи...' : 
                updateTaskStatus.isPending ? 'Обновление статуса...' : 
                'Обновление приоритета...'}
              </Typography>
            </Paper>
          </motion.div>
        )}
      </Box>

      {/* Канбан-доска */}
      <AnimatePresence mode="wait">
        <motion.div 
          key="kanban-board"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
          style={{ height: 'calc(100vh - 200px)' }}
        >
          <KanbanBoard 
            issues={filteredTasks} 
            onIssueClick={setSelectedTask} 
            onStatusChange={handleStatusChange}
            onDelete={handleTaskDelete}
            isDeleting={deleteTask.isPending}
            deleteSuccess={deleteSuccess}
            deletedIssues={deletedTasks}
            onRestore={handleRestoreTask}
          />
        </motion.div>
      </AnimatePresence>

      {/* Модальное окно просмотра/редактирования задачи */}
      {selectedTask && (
        <TaskModal
          open={!!selectedTask}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleUpdateTask}
          onDelete={handleTaskDelete}
        />
      )}
      
      {/* Модальное окно создания новой задачи */}
      <TaskModal
        open={isCreateModalOpen}
        isNew={true}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleNewTaskSaved}
      />

      {/* Диалог подтверждения действий - стилизованный */}
      <Dialog
        open={confirmationDialogOpen}
        onClose={handleCancelConfirmation}
        TransitionComponent={Grow}
        PaperProps={{
          sx: { 
            borderRadius: theme.shape.borderRadius * 2, 
            minWidth: '400px',
            background: theme.palette.mode === 'dark' 
              ? `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.8)})` 
              : `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.85)})`,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.2)}`,
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: confirmationDialogType === 'delete-permanent' || confirmationDialogType === 'clear-trash'
                ? `linear-gradient(to right, ${theme.palette.error.main}, ${theme.palette.error.light})`
                : confirmationDialogType === 'restore'
                  ? `linear-gradient(to right, ${theme.palette.success.main}, ${theme.palette.success.light})`
                  : `linear-gradient(to right, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
              zIndex: 1
            }
          }
        }}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(5px)',
            backgroundColor: alpha(theme.palette.background.default, 0.5),
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pt: 4, pb: 2 }}>
          {confirmationDialogType === 'move-to-trash' && 'Переместить задачу в корзину?'}
          {confirmationDialogType === 'restore' && 'Восстановить задачу?'}
          {confirmationDialogType === 'delete-permanent' && 'Удалить задачу навсегда?'}
          {confirmationDialogType === 'clear-trash' && 'Очистить корзину?'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '1rem' }}>
            {confirmationDialogType === 'move-to-trash' && 
              `Вы уверены, что хотите переместить задачу "${taskToConfirm?.title || `#${taskToConfirm?.id}`}" в корзину?`
            }
            {confirmationDialogType === 'restore' && 
              `Вы уверены, что хотите восстановить задачу "${taskToConfirm?.title || `#${taskToConfirm?.id}`}"?`
            }
            {confirmationDialogType === 'delete-permanent' && 
              <>
                Вы уверены, что хотите удалить задачу "{taskToConfirm?.title || `#${taskToConfirm?.id}`}" навсегда?
                <Box sx={{ 
                  backgroundColor: alpha(theme.palette.error.main, 0.1), 
                  p: 1.5, 
                  borderRadius: 1.5, 
                  mt: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                }}>
                  <Typography sx={{ color: theme.palette.error.dark, fontWeight: 600 }}>
                    Это действие нельзя будет отменить.
                  </Typography>
                </Box>
              </>
            }
            {confirmationDialogType === 'clear-trash' && 
              <>
                Вы уверены, что хотите очистить всю корзину? Это приведет к удалению {deletedTaskIds.size} задач из корзины.
                <Box sx={{ 
                  backgroundColor: alpha(theme.palette.error.main, 0.1), 
                  p: 1.5, 
                  borderRadius: 1.5, 
                  mt: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                }}>
                  <Typography sx={{ color: theme.palette.error.dark, fontWeight: 600 }}>
                    Это действие нельзя будет отменить.
                  </Typography>
                </Box>
              </>
            }
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button 
              onClick={handleCancelConfirmation} 
              variant="outlined" 
              sx={{ borderRadius: theme.shape.borderRadius * 1.5, px: 3 }}
            >
              Отмена
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button 
              onClick={handleConfirmAction}
              variant="contained"
              color={confirmationDialogType === 'delete-permanent' || confirmationDialogType === 'clear-trash' ? "error" : 
                     confirmationDialogType === 'restore' ? "success" : "warning"}
              sx={{ 
                borderRadius: theme.shape.borderRadius * 1.5, 
                px: 3,
                boxShadow: confirmationDialogType === 'delete-permanent' || confirmationDialogType === 'clear-trash' ? 
                  `0 4px 14px ${alpha(theme.palette.error.main, 0.4)}` : 
                  confirmationDialogType === 'restore' ?
                  `0 4px 14px ${alpha(theme.palette.success.main, 0.4)}` :
                  `0 4px 14px ${alpha(theme.palette.warning.main, 0.4)}`,
              }}
            >
              {confirmationDialogType === 'move-to-trash' && 'В корзину'}
              {confirmationDialogType === 'restore' && 'Восстановить'}
              {confirmationDialogType === 'delete-permanent' && 'Удалить навсегда'}
              {confirmationDialogType === 'clear-trash' && 'Очистить'}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>

      {/* Модальное окно корзины задач - стилизованное */}
      <Dialog 
        open={trashModalOpen} 
        onClose={() => setTrashModalOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Grow}
        PaperProps={{
          sx: { 
            borderRadius: theme.shape.borderRadius * 2,
            background: theme.palette.mode === 'dark' 
              ? `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.8)})` 
              : `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.85)})`,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.2)}`,
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
              zIndex: 1
            }
          }
        }}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(5px)',
            backgroundColor: alpha(theme.palette.background.default, 0.5),
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          pt: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <DeleteIcon color="secondary" />
          <Box>
            Корзина удаленных задач 
            <Badge 
              color="secondary" 
              badgeContent={deletedTasks.length} 
              sx={{ ml: 2 }} 
              max={999}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <AnimatePresence>
            {deletedTasks.length > 0 ? (
              <Box sx={{ mt: 1, maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
                {deletedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    layout
                  >
                    <StyledTaskCard
                      elevation={2}
                      sx={{ 
                        borderLeft: `4px solid ${
                          task.priority === 'High' ? theme.palette.error.main :
                          task.priority === 'Medium' ? theme.palette.warning.main :
                          theme.palette.success.main
                        }`,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>{task.title}</Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mt: 0.5
                          }}
                        >
                          {task.description && task.description.slice(0, 140)}
                          {task.description && task.description.length > 140 ? '...' : ''}
                        </Typography>
                        
                        {/* Статусы и метки */}
                        <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                          <Chip 
                            label={
                              task.status === 'Backlog' ? 'К выполнению' : 
                              task.status === 'InProgress' ? 'В работе' : 'Готово'
                            }
                            color={
                              task.status === 'Backlog' ? 'info' :
                              task.status === 'InProgress' ? 'warning' : 'success'
                            }
                            size="small"
                            variant="outlined"
                          />
                          
                          <Chip 
                            label={
                              task.priority === 'High' ? 'Высокий' : 
                              task.priority === 'Medium' ? 'Средний' : 'Низкий'
                            }
                            color={
                              task.priority === 'High' ? 'error' :
                              task.priority === 'Medium' ? 'warning' : 'success'
                            }
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant="outlined"
                            size="small"
                            color="secondary"
                            startIcon={<RestoreFromTrashIcon />}
                            onClick={() => handleRestoreTask(task.id)}
                            sx={{
                              borderRadius: theme.shape.borderRadius * 1.5,
                              borderColor: theme.palette.secondary.main,
                              borderWidth: 2,
                            }}
                          >
                            Восстановить
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant="outlined" 
                            color="error"
                            size="small"
                            onClick={() => handlePermanentDeleteTask(task.id)}
                            sx={{
                              borderRadius: theme.shape.borderRadius * 1.5,
                              borderColor: theme.palette.error.main,
                              borderWidth: 2,
                            }}
                          >
                            Удалить навсегда
                          </Button>
                        </motion.div>
                      </Box>
                    </StyledTaskCard>
                  </motion.div>
                ))}
              </Box>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 8,
                  opacity: 0.8
                }}>
                  <DeleteIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.5), mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Корзина пуста
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Здесь появятся удаленные задачи
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
          {deletedTasks.length > 0 && (
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

      {/* Улучшенные уведомления */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert 
          severity="success" 
          variant="filled" 
          icon={<motion.div
            animate={{ rotate: [0, 0, -10, 10, 0] }}
            transition={{ duration: 1.5, times: [0, 0.2, 0.4, 0.6, 1] }}
          >
            <AutoAwesomeIcon />
          </motion.div>}
          sx={{ 
            width: '100%',
            borderRadius: theme.shape.borderRadius * 1.5,
            boxShadow: `0 10px 30px ${alpha(theme.palette.success.dark, 0.3)}`,
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={4000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert 
          severity="error" 
          variant="filled" 
          sx={{ 
            width: '100%',
            borderRadius: theme.shape.borderRadius * 1.5,
            boxShadow: `0 10px 30px ${alpha(theme.palette.error.dark, 0.3)}`,
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </GlassContainer>
  );
}
