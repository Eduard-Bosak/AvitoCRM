import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  Card, CardContent, Typography, Stack, Chip, Paper, Box, 
  Avatar, Grow, Fade, useTheme, alpha, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Tooltip, LinearProgress, Alert, Snackbar,
  Menu, MenuItem, ListItemIcon, ListItemText, Divider, Grid, useMediaQuery,
  Zoom, Skeleton, Badge
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FlagIcon from '@mui/icons-material/Flag';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RestoreIcon from '@mui/icons-material/Restore';
import { motion } from 'framer-motion';
import { Issue, STATUS_LABELS } from '../types/issue';
import { styled } from '@mui/material/styles';

export interface KanbanBoardProps {
  issues?: Issue[];
  onIssueClick?: (issue: Issue) => void;
  onStatusChange?: (issueId: number | string, newStatus: string, newPriority?: string) => void;
  onCustomStatusCreate?: (key: string, label: string) => void;
  onDelete?: (issueId: number | string) => void;
  isDeleting?: boolean;
  deleteSuccess?: boolean;
  board?: { id: string | number; name: string };
  // Добавляем новые пропсы для работы с виртуально удаленными задачами
  deletedIssues?: Issue[];
  onRestore?: (issueId: number | string) => void;
}

interface CustomStatus {
  key: string;
  label: string;
}

const DEFAULT_STATUS_LIST: CustomStatus[] = [
  { key: 'Backlog', label: STATUS_LABELS.Backlog },
  { key: 'InProgress', label: STATUS_LABELS.InProgress },
  { key: 'Done', label: STATUS_LABELS.Done },
];

// Стили для колонок с добавленными тенями и градиентами
const StyledColumn = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  minHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.8) 
    : theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0,0,0,0.3)' 
    : '0 4px 20px rgba(0,0,0,0.08)',
  border: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.2))',
    borderTopRightRadius: theme.shape.borderRadius,
    borderTopLeftRadius: theme.shape.borderRadius,
  }
}));

// Улучшенная стилизованная карточка для задач с красивыми эффектами
const IssueCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1, 0),
  cursor: 'pointer',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  border: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['transform', 'box-shadow', 'opacity', 'background-color'], {
    duration: theme.transitions.duration.shorter
  }),
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    '& .issue-controls': {
      opacity: 1,
    },
    '& .issue-drag-handle': {
      opacity: 0.7,
    }
  },
  '&.is-dragging': {
    background: `linear-gradient(45deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.primary.light, 0.1)})`,
    boxShadow: '0 14px 28px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.12)',
    transform: 'rotate(-1deg) scale(1.02)',
    zIndex: 2000,
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: theme.shape.borderRadius,
      boxShadow: `inset 0 0 0 2px ${theme.palette.primary.main}`,
      pointerEvents: 'none',
    }
  },
  '&.deleting': {
    opacity: 0.5,
    backgroundColor: alpha(theme.palette.error.light, 0.08),
    boxShadow: 'none',
    transform: 'scale(0.95) translateY(5px)',
    filter: 'blur(1px)',
  },
  '&.new-added': {
    animation: 'pulse 1.5s',
    backgroundColor: alpha(theme.palette.success.light, 0.15),
    boxShadow: `0 0 0 1px ${theme.palette.success.light}`,
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0.5)}`,
      backgroundColor: alpha(theme.palette.success.light, 0.3),
      transform: 'scale(1)',
    },
    '50%': {
      boxShadow: `0 0 0 10px ${alpha(theme.palette.success.main, 0)}`,
      backgroundColor: alpha(theme.palette.success.light, 0.15),
      transform: 'scale(1.03)',
    },
    '100%': {
      boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0)}`,
      backgroundColor: alpha(theme.palette.success.light, 0.05),
      transform: 'scale(1)',
    }
  }
}));

// Определение цветов/заголовков колонок
const columns = [
  { id: 'Backlog', title: 'К выполнению', color: 'info' },
  { id: 'InProgress', title: 'В работе', color: 'warning' },
  { id: 'Done', title: 'Готово', color: 'success' },
];

// Функция для определения цвета приоритета
const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'success';
    default: return 'default';
  }
};

/**
 * KanbanBoard — отображение задач по статусам с drag-and-drop
 * и возможностью создания новых этапов
 * С улучшенной адаптивностью для мобильных устройств и анимациями
 */
const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  issues, 
  onIssueClick, 
  onStatusChange,
  onCustomStatusCreate,
  onDelete,
  isDeleting = false,
  deleteSuccess = false,
  board,
  deletedIssues = [],
  onRestore
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [statusList, setStatusList] = useState<CustomStatus[]>(DEFAULT_STATUS_LIST);
  const [newStatusDialogOpen, setNewStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState({ key: '', label: '' });
  const [localIssues, setLocalIssues] = useState<Issue[]>([]);
  
  // Добавляем состояние для модального окна корзины
  const [trashModalOpen, setTrashModalOpen] = useState(false);
  
  // Синхронизация состояния localIssues с входящими issues из props
  useEffect(() => {
    if (issues && Array.isArray(issues)) {
      setLocalIssues(issues);
    }
  }, [issues]);
  
  const [lastAddedId, setLastAddedId] = useState<number | null>(null);
  const [hasPendingOperations, setHasPendingOperations] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingIssueId, setDeletingIssueId] = useState<number | string | null>(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);
  
  // State for context menu
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    taskId?: number | string;
    currentStatus?: string;
    currentPriority?: string;
    menuType: 'status' | 'priority' | 'main';
  } | null>(null);
  
  // Отслеживаем удаление задач для оптимистичных обновлений
  const optimisticDeletes = useRef(new Set<number | string>()).current;
  const optimisticStatusChanges = useRef(new Map<number | string, string>()).current;
  
  // Синхронизация входящих задач с локальным состоянием
  useEffect(() => {
    if (!Array.isArray(issues)) return;
    
    // Создаем новый массив задач с применением оптимистических обновлений
    const updatedIssues = issues.map(issue => {
      // Если задача находится в списке оптимистических обновлений статуса
      if (optimisticStatusChanges.has(issue.id)) {
        const newStatus = optimisticStatusChanges.get(issue.id);
        return { ...issue, status: newStatus };
      }
      // Если задача не находится в списке удаленных
      if (!optimisticDeletes.has(issue.id)) {
        return issue;
      }
      return null;
    }).filter(Boolean) as Issue[];
    
    // Проверка на реальные изменения перед обновлением состояния
    if (JSON.stringify(updatedIssues) !== JSON.stringify(localIssues)) {
      setLocalIssues(updatedIssues);
    }
  }, [issues, optimisticStatusChanges, optimisticDeletes]);

  // Эффект для отслеживания изменений в props.issues и обновления localIssues
  useEffect(() => {
    if (!Array.isArray(issues)) {
      return;
    }
    
    // Создаем карту задач с учетом оптимистичных изменений
    const updatedIssues = issues.map(issue => {
      // Если для этой задачи есть оптимистичное изменение статуса - применяем его
      if (optimisticStatusChanges.has(issue.id)) {
        return {
          ...issue,
          status: optimisticStatusChanges.get(issue.id) as TaskStatus
        };
      }
      
      // Иначе возвращаем оригинальную задачу
      return { ...issue };
    });
    
    // Фильтруем задачи, которые были оптимистично удалены
    const filteredIssues = updatedIssues.filter(issue => 
      !optimisticDeletes.has(issue.id)
    );

    // Оптимизация: проверяем, действительно ли есть изменения перед обновлением состояния
    const issuesChanged = 
      localIssues.length !== filteredIssues.length || 
      !localIssues.every((issue, index) => {
        const incoming = filteredIssues[index];
        return incoming && 
               issue.id === incoming.id && 
               issue.status === incoming.status &&
               issue.priority === incoming.priority &&
               issue.title === incoming.title;
      });

    if (issuesChanged) {
      setLocalIssues(filteredIssues);
    }
  }, [issues]);

  // Группировка задач по статусам
  const columnIssues = statusList.map(status => ({
    ...status,
    issues: localIssues.filter(issue => issue.status === status.key),
  }));

  /**
   * Обработчик завершения перетаскивания
   */
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // Если нет места назначения или перетаскивание в то же место - ничего не делаем
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
  
    // Находим перетаскиваемую задачу
    const taskId = draggableId;
    const taskToMove = localIssues.find(issue => issue.id.toString() === taskId);
    
    if (!taskToMove) {
      console.error('Task not found:', taskId);
      return;
    }
  
    const newStatus = destination.droppableId;
    
    // Если статус не изменился, просто меняем порядок в колонке
    if (newStatus === taskToMove.status) {
      // Создаем новый массив задач с обновленным порядком
      const reorderedIssues = [...localIssues];
      const removed = reorderedIssues.splice(source.index, 1)[0];
      reorderedIssues.splice(destination.index, 0, removed);
      setLocalIssues(reorderedIssues);
      return;
    }
    
    console.log(`Moving task ${taskId} from ${taskToMove.status} to ${newStatus}`);
    
    // Оптимистично обновляем UI немедленно
    const updatedIssues = localIssues.map(issue => 
      issue.id.toString() === taskId ? { ...issue, status: newStatus } : issue
    );
    
    // Применяем локальное изменение
    setLocalIssues(updatedIssues);
    
    // Если передан обработчик изменения статуса, вызываем его
    if (onStatusChange) {
      onStatusChange(taskId, newStatus);
    }
  };

  /**
   * Обработчик открытия контекстного меню
   */
  const handleContextMenu = (
    event: React.MouseEvent, 
    taskId: number | string, 
    currentStatus: string,
    currentPriority?: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      taskId,
      currentStatus,
      currentPriority,
      menuType: 'main'
    });
  };

  /**
   * Закрыть контекстное меню
   */
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  /**
   * Показать подменю статусов
   */
  const handleShowStatusMenu = () => {
    if (!contextMenu) return;
    
    setContextMenu({
      ...contextMenu,
      menuType: 'status'
    });
  };

  /**
   * Показать подменю приоритетов
   */
  const handleShowPriorityMenu = () => {
    if (!contextMenu) return;
    
    setContextMenu({
      ...contextMenu,
      menuType: 'priority'
    });
  };

  /**
   * Вернуться в главное меню
   */
  const handleShowMainMenu = () => {
    if (!contextMenu) return;
    
    setContextMenu({
      ...contextMenu,
      menuType: 'main'
    });
  };

  /**
   * Изменение статуса через контекстное меню
   */
  const handleStatusChangeFromMenu = (newStatus: string) => {
    if (!contextMenu?.taskId) return;
    
    // Оптимистично обновляем UI
    optimisticStatusChanges.set(contextMenu.taskId, newStatus);
    
    // Создаем копию локальных задач для оптимистичного обновления
    const updatedIssues = localIssues.map(issue => 
      issue.id === contextMenu.taskId 
        ? { ...issue, status: newStatus } 
        : issue
    );
    
    // Применяем оптимистичное обновление
    setLocalIssues(updatedIssues);
    
    // Уведомляем родительский компонент
    if (onStatusChange) {
      // Симулируем задержку сети
      setHasPendingOperations(true);
      setTimeout(() => {
        onStatusChange(contextMenu.taskId!, newStatus);
        optimisticStatusChanges.delete(contextMenu.taskId!);
        setHasPendingOperations(false);
      }, 800);
    }
    
    handleCloseContextMenu();
  };

  /**
   * Изменение приоритета через контекстное меню
   */
  const handlePriorityChange = (newPriority: string) => {
    if (!contextMenu?.taskId || !onStatusChange) return;
    
    // Получаем текущий статус задачи
    const currentStatus = contextMenu.currentStatus || '';
    
    // Оптимистично обновляем UI
    const updatedIssues = localIssues.map(issue => 
      issue.id === contextMenu.taskId 
        ? { ...issue, priority: newPriority } 
        : issue
    );
    
    // Применяем оптимистичное обновление
    setLocalIssues(updatedIssues);
    
    // Уведомляем родительский компонент
    setHasPendingOperations(true);
    
    // Симулируем задержку сети
    setTimeout(() => {
      onStatusChange(contextMenu.taskId!, currentStatus, newPriority);
      setHasPendingOperations(false);
    }, 800);
    
    handleCloseContextMenu();
  };

  /**
   * Удаление задачи из контекстного меню
   */
  const handleDeleteFromMenu = () => {
    if (!contextMenu?.taskId || !onDelete) return;
    
    // Устанавливаем ID удаляемой задачи для визуальной индикации
    setDeletingIssueId(contextMenu.taskId);
    
    // Оптимистично добавляем в Set удаляемых задач
    optimisticDeletes.add(contextMenu.taskId);
    
    // Оптимистично обновляем локальное состояние задач
    setLocalIssues(localIssues.filter(issue => issue.id !== contextMenu.taskId));
    
    // Вызываем колбэк для удаления задачи из родительского компонента
    onDelete(contextMenu.taskId);
    
    // Закрываем контекстное меню
    handleCloseContextMenu();
  };

  /**
   * Открыть диалог для создания нового статуса
   */
  const handleOpenNewStatusDialog = () => {
    setNewStatus({ key: '', label: '' });
    setNewStatusDialogOpen(true);
  };

  /**
   * Закрыть диалог для создания нового статуса
   */
  const handleCloseNewStatusDialog = () => {
    setNewStatusDialogOpen(false);
  };

  /**
   * Обработка создания нового статуса
   */
  const handleCreateNewStatus = () => {
    if (!newStatus.key || !newStatus.label) {
      setErrorMessage('Ключ и название статуса обязательны');
      return;
    }

    // Проверка, что ключ уникален
    if (statusList.some(status => status.key === newStatus.key)) {
      setErrorMessage(`Статус с ключом "${newStatus.key}" уже существует`);
      return;
    }

    // Добавляем новый статус
    setStatusList([...statusList, newStatus]);
    
    // Вызываем callback для создания статуса
    if (onCustomStatusCreate) {
      onCustomStatusCreate(newStatus.key, newStatus.label);
    }
    
    // Сбрасываем состояние и закрываем диалог
    setNewStatus({ key: '', label: '' });
    setNewStatusDialogOpen(false);
  };
  
  /**
   * Обработка удаления задачи
   */
  const handleDeleteTask = (taskId: number | string) => {
    if (!onDelete) return;
    
    // Находим задачу в списке
    const task = localIssues.find(issue => issue.id === taskId);
    if (!task) return;
    
    // Устанавливаем ID удаляемой задачи
    setDeletingIssueId(taskId);
    
    // Оптимистично обновляем UI
    optimisticDeletes.add(taskId);
    
    // Обновляем локальный список задач без удаленной задачи
    setLocalIssues(localIssues.filter(issue => issue.id !== taskId));
    
    // Симулируем задержку сети
    setHasPendingOperations(true);
    setTimeout(() => {
      onDelete(taskId);
      setHasPendingOperations(false);
    }, 800);
  };

  /**
   * Обработчик восстановления задачи
   */
  const handleRestoreTask = (taskId: number | string) => {
    if (onRestore) {
      onRestore(taskId);
      setDeleteSuccessMessage(`Задача #${taskId} восстановлена`);
    }
    
    // При необходимости закрываем модальное окно корзины
    if (deletedIssues?.length === 1) {
      setTrashModalOpen(false);
    }
  };

  /**
   * Отрисовка карточки задачи
   */
  const renderIssueCard = (issue: Issue, index: number) => {
    const isNew = lastAddedId === issue.id;
    const isDragging = optimisticStatusChanges.has(issue.id);
    const isDeleting = deletingIssueId === issue.id;
    
    return (
      <Draggable 
        key={issue.id}
        draggableId={issue.id.toString()}
        index={index}
      >
        {(provided, snapshot) => (
          <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }}>
            <IssueCard
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps} // Apply drag handle props to the entire card
              className={`
                ${isNew ? 'new-added' : ''}
                ${isDragging || snapshot.isDragging ? 'is-dragging' : ''}
                ${isDeleting ? 'deleting' : ''}
              `}
              elevation={snapshot.isDragging ? 3 : 1}
              sx={{
                opacity: snapshot.isDragging ? 0.9 : 1,
                backgroundColor: snapshot.isDragging 
                  ? alpha(theme.palette.background.paper, 0.95)
                  : alpha(theme.palette.background.paper, 0.5),
                transform: snapshot.isDragging ? 'rotate(-2deg) scale(1.02)' : 'none',
                boxShadow: snapshot.isDragging 
                  ? '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)' 
                  : undefined,
                // Используем левую границу для обозначения приоритета вместо квадрата в верхнем правом углу
                borderLeft: `4px solid ${theme.palette[getPriorityColor(issue.priority || 'medium') as 'error' | 'success' | 'warning' | 'default'].main}`,
                position: 'relative',
                cursor: 'grab', // Добавляем курсор grab для обозначения возможности перетаскивания
                '&:active': { cursor: 'grabbing' }, // Меняем курсор при активном перетаскивании
              }}
              onClick={() => onIssueClick && onIssueClick(issue)}
              onContextMenu={(e) => handleContextMenu(e, issue.id, issue.status, issue.priority)}
            >
              {/* Card header with title and drag handle visual indicator */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="medium" noWrap>
                  {issue.title}
                </Typography>
                {/* Removed square indicator and kept only drag handle */}
                <Box 
                  className="issue-drag-handle"
                  sx={{ 
                    opacity: 0.3, 
                    transition: 'all 0.2s',
                    '&:hover': { 
                      opacity: 0.8,
                      transform: 'scale(1.1)',
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  <DragIndicatorIcon fontSize="small" color="action" />
                </Box>
              </Box>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 2, 
                  opacity: 0.8,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {issue.description}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                <Chip 
                  size="small" 
                  label={issue.priority || 'Medium'} 
                  color={getPriorityColor(issue.priority || 'medium') as any}
                  variant="outlined"
                  icon={
                    issue.priority === 'High' ? <PriorityHighIcon fontSize="small" /> : 
                    issue.priority === 'Low' ? <LowPriorityIcon fontSize="small" /> : 
                    <FlagIcon fontSize="small" />
                  }
                  sx={{ 
                    mr: 1, 
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: `0 0 0 1px ${theme.palette[getPriorityColor(issue.priority || 'medium') as 'error' | 'success' | 'warning' | 'default'].main}`,
                    }
                  }}
                  onClick={(e) => {
                    // Prevent the card's onClick from firing
                    e.stopPropagation();
                  }}
                />
                
                {issue.assigneeId && (
                  <Tooltip title={`Исполнитель ID: ${issue.assigneeId}`}>
                    <Avatar
                      sx={{ 
                        width: 28, 
                        height: 28, 
                        bgcolor: `${theme.palette.primary.main}30`,
                        fontSize: '0.875rem',
                        color: theme.palette.primary.main,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                        }
                      }}
                      onClick={(e) => {
                        // Prevent the card's onClick from firing
                        e.stopPropagation();
                      }}
                    >
                      {issue.assigneeId.toString().slice(0, 2)}
                    </Avatar>
                  </Tooltip>
                )}
                
                <Box className="issue-controls" sx={{ 
                  opacity: 0,
                  transition: 'all 0.2s',
                  ml: 'auto',
                  display: 'flex'
                }}>
                  <Tooltip title="Опции">
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, issue.id, issue.status, issue.priority);
                      }}
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'rotate(90deg)',
                          color: theme.palette.primary.main,
                        }
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {/* Task ID badge */}
              <Box 
                sx={{ 
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  fontSize: '0.7rem',
                  opacity: 0.4,
                  color: theme.palette.text.secondary,
                }}
              >
                #{issue.id}
              </Box>
            </IssueCard>
          </Zoom>
        )}
      </Draggable>
    );
  };

  /**
   * Отрисовка колонки статуса
   */
  const renderColumn = (status: CustomStatus) => {
    const columnColor = status.key === 'Backlog' ? 'info' : status.key === 'InProgress' ? 'warning' : 'success';
    const columnIssues = localIssues.filter(issue => issue.status === status.key);
    
    return (
      <motion.div
        key={status.key}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ width: 300, mr: 2, flexShrink: 0 }}>
          <StyledColumn 
            className="kanban-column"
            sx={{
              boxShadow: theme.shadows[2],
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[4],
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Box 
              sx={{ 
                p: 2, 
                mb: 1,
                background: `linear-gradient(135deg, ${alpha(theme.palette[columnColor as 'info' | 'warning' | 'success'].main, 0.2)} 0%, ${alpha(theme.palette[columnColor as 'info' | 'warning' | 'success'].main, 0.05)} 100%)`,
                borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="medium">
                  {status.label}
                </Typography>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge 
                    badgeContent={columnIssues.length} 
                    color={columnColor as any} 
                    showZero
                    sx={{
                      '& .MuiBadge-badge': {
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <Box />
                  </Badge>
                </motion.div>
              </Box>
            </Box>
            
            <Droppable droppableId={status.key}>
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    flexGrow: 1,
                    minHeight: 200,
                    px: 1,
                    py: 1,
                    backgroundColor: snapshot.isDraggingOver 
                      ? alpha(theme.palette[columnColor as 'info' | 'warning' | 'success'].main, 0.08)
                      : 'transparent',
                    transition: 'all 0.3s ease',
                    borderRadius: theme.shape.borderRadius,
                    position: 'relative',
                  }}
                >
                  {/* Shine effect when dragging over */}
                  {snapshot.isDraggingOver && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: theme.shape.borderRadius,
                        background: `linear-gradient(135deg, transparent 0%, ${alpha(theme.palette[columnColor as 'info' | 'warning' | 'success'].main, 0.1)} 50%, transparent 100%)`,
                        backgroundSize: '200% 200%',
                        animation: 'shine 1.5s linear infinite',
                        '@keyframes shine': {
                          '0%': { backgroundPosition: '-100% -100%' },
                          '100%': { backgroundPosition: '100% 100%' }
                        },
                        pointerEvents: 'none',
                        zIndex: 0
                      }}
                    />
                  )}
                  
                  {columnIssues.length > 0 ? (
                    columnIssues.map((issue, index) => renderIssueCard(issue, index))
                  ) : (
                    <Box 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        p: 2,
                        opacity: 0.5,
                        borderRadius: theme.shape.borderRadius,
                        border: `2px dashed ${alpha(theme.palette[columnColor as 'info' | 'warning' | 'success'].main, 0.3)}`,
                        backgroundColor: snapshot.isDraggingOver ? alpha(theme.palette.background.paper, 0.5) : 'transparent',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Typography align="center" color="textSecondary">
                        {snapshot.isDraggingOver ? 
                          'Перетащите сюда...' : 
                          'Нет задач'
                        }
                      </Typography>
                    </Box>
                  )}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </StyledColumn>
        </Box>
      </motion.div>
    );
  };

  // Рендер компонента
  return (
    <Box sx={{ 
      py: 2, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Заголовок доски */}
      {board && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              {board.name}
            </Typography>
          </motion.div>
          
          {/* Кнопка корзины, если есть удаленные задачи */}
          {deletedIssues && deletedIssues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<DeleteIcon />}
                onClick={() => setTrashModalOpen(true)}
                sx={{ mb: 2 }}
              >
                Корзина ({deletedIssues.length})
              </Button>
            </motion.div>
          )}
        </Box>
      )}
      
      {/* Индикатор загрузки для операций */}
      {hasPendingOperations && (
        <Box sx={{ width: '100%', position: 'relative', mb: 1 }}>
          <LinearProgress
            sx={{
              borderRadius: 1,
              height: 4
            }}
          />
        </Box>
      )}
      
      {/* Кнопка добавления нового этапа */}
      {onCustomStatusCreate && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleOpenNewStatusDialog}
              sx={{ 
                borderRadius: 2,
                boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                '&:hover': {
                  boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                }
              }}
            >
              Добавить этап
            </Button>
          </motion.div>
        </Box>
      )}
      
      {/* Контейнер доски с колонками */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Box
          sx={{
            overflowX: 'auto',
            pb: 2,
            // Улучшаем скроллирование на мобильных устройствах
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.grey[500], 0.3),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: alpha(theme.palette.grey[200], 0.2),
              borderRadius: '4px',
            },
          }}
        >
          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ 
              minWidth: isMobile ? undefined : statusList.length * 300,
              width: isMobile ? `${statusList.length * 280}px` : '100%',
              height: '100%',
              pb: 2
            }}
          >
            {statusList.map(renderColumn)}
            
            {/* Кнопка для добавления нового статуса в конце доски */}
            {onCustomStatusCreate && !isMobile && (
              <Grow in={true}>
                <Box 
                  sx={{ 
                    width: 300, 
                    height: 150, 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleOpenNewStatusDialog}
                    sx={{ 
                      borderStyle: 'dashed',
                      height: 100,
                      width: '100%',
                      opacity: 0.7,
                      '&:hover': {
                        opacity: 1,
                      }
                    }}
                  >
                    Новый этап
                  </Button>
                </Box>
              </Grow>
            )}
          </Stack>
        </Box>
      </DragDropContext>
      
      {/* Диалог для создания нового статуса */}
      <Dialog open={newStatusDialogOpen} onClose={handleCloseNewStatusDialog}>
        <DialogTitle>Добавление нового статуса</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Ключ статуса (англ, без пробелов)"
            fullWidth
            variant="outlined"
            value={newStatus.key}
            onChange={(e) => setNewStatus({ ...newStatus, key: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Название статуса"
            fullWidth
            variant="outlined"
            value={newStatus.label}
            onChange={(e) => setNewStatus({ ...newStatus, label: e.target.value })}
          />
          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewStatusDialog}>Отмена</Button>
          <Button onClick={handleCreateNewStatus} color="primary" variant="contained">
            Создать
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Контекстное меню для задач */}
      <Menu
        open={!!contextMenu}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {contextMenu?.menuType === 'main' && (
          <>
            {/* Убираем кнопку "Изменить статус", так как статус меняется путем drag-and-drop */}
            <MenuItem 
              onClick={handleShowPriorityMenu}
              dense
            >
              <ListItemIcon>
                <FlagIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Изменить приоритет" />
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem 
              onClick={handleDeleteFromMenu}
              dense
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Удалить задачу" />
            </MenuItem>
          </>
        )}
        
        {contextMenu?.menuType === 'status' && (
          <>
            <MenuItem onClick={handleShowMainMenu} dense>
              <ListItemIcon><ArrowBackIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Назад" />
            </MenuItem>
            <Divider />
            {statusList.map((status) => (
              <MenuItem
                key={status.key}
                onClick={() => handleStatusChangeFromMenu(status.key)}
                dense
                selected={contextMenu.currentStatus === status.key}
                disabled={contextMenu.currentStatus === status.key}
              >
                <ListItemText primary={status.label} />
                {contextMenu.currentStatus === status.key && (
                  <ListItemIcon sx={{ justifyContent: 'flex-end' }}>
                    <CheckCircleIcon fontSize="small" />
                  </ListItemIcon>
                )}
              </MenuItem>
            ))}
          </>
        )}
        
        {contextMenu?.menuType === 'priority' && (
          <>
            <MenuItem onClick={handleShowMainMenu} dense>
              <ListItemIcon><ArrowBackIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Назад" />
            </MenuItem>
            <Divider />
            {['Low', 'Medium', 'High'].map((priority) => (
              <MenuItem
                key={priority}
                onClick={() => handlePriorityChange(priority)}
                dense
                selected={contextMenu.currentPriority === priority}
                disabled={contextMenu.currentPriority === priority}
              >
                <ListItemIcon>
                  {priority === 'Low' && <LowPriorityIcon fontSize="small" color="success" />}
                  {priority === 'Medium' && <FlagIcon fontSize="small" color="warning" />}
                  {priority === 'High' && <PriorityHighIcon fontSize="small" color="error" />}
                </ListItemIcon>
                <ListItemText primary={priority} />
              </MenuItem>
            ))}
          </>
        )}
      </Menu>
      
      {/* Модальное окно корзины */}
      <Dialog
        open={trashModalOpen}
        onClose={() => setTrashModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Корзина удаленных задач ({deletedIssues?.length || 0})
        </DialogTitle>
        <DialogContent>
          {deletedIssues && deletedIssues.length > 0 ? (
            <Box sx={{ mt: 1 }}>
              {deletedIssues.map((issue) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: `4px solid ${theme.palette[getPriorityColor(issue.priority || 'medium') as 'error' | 'success' | 'warning' | 'default'].main}`,
                      borderRadius: 1
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {issue.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip 
                          size="small" 
                          label={
                            issue.status === 'Backlog' ? 'К выполнению' :
                            issue.status === 'InProgress' ? 'В работе' : 'Готово'
                          }
                          color={
                            issue.status === 'Backlog' ? 'info' :
                            issue.status === 'InProgress' ? 'warning' : 'success'
                          }
                          variant="outlined"
                        />
                        <Chip 
                          size="small" 
                          label={issue.priority || 'Medium'} 
                          color={getPriorityColor(issue.priority || 'medium') as any}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RestoreIcon />}
                        onClick={() => handleRestoreTask(issue.id)}
                      >
                        Восстановить
                      </Button>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Корзина пуста
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTrashModalOpen(false)}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Уведомление об успешно удаленной задаче */}
      <Snackbar
        open={!!deleteSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setDeleteSuccessMessage(null)}
        message={deleteSuccessMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      
      {/* Уведомление об ошибке */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KanbanBoard;
