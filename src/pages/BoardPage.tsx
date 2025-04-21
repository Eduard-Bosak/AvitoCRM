import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard';
import IssueModal from '../components/IssueModal';
import CreateIssueModal from '../components/CreateIssueModal';
import { useDeleteTask } from '@/shared/hooks/useDeleteTask';
import { Issue } from '../types/issue';
import { 
  Button, Alert, CircularProgress, Container, Typography, 
  Box, Paper, alpha, useTheme, Fade, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions,
  Card, Chip, Grid, IconButton, Tooltip, LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import { useUpdateTaskStatus } from '@/shared/hooks/useUpdateTaskStatus'; // Меняем импорт
import { useUpdateIssuePriority } from '@/shared/hooks/useUpdateIssuePriority'; // Добавляем импорт для приоритетов
import { useBoards } from '@/shared/hooks/useBoards';
import { useTasks } from '@/shared/hooks/useTasks';
import { motion } from 'framer-motion';

/**
 * Страница доски с отображением задач в формате Kanban
 * с возможностью drag-and-drop и автоматическим открытием задачи при переходе по URL с параметром issueId
 */
const BoardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const issueIdFromUrl = searchParams.get('issueId');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { id } = useParams();
  const boardId = Number(id);
  const { data: boards, isLoading: isBoardsLoading } = useBoards();
  const { data: allTasks, isLoading: isTasksLoading, refetch: refetchTasks } = useTasks();
  const { mutate: deleteTask, isError: isDeleteError } = useDeleteTask();
  
  // Используем отдельные хуки для статуса и приоритета
  const { mutate: updateStatus } = useUpdateTaskStatus();
  const { mutate: updatePriority } = useUpdateIssuePriority();
  
  const [selected, setSelected] = React.useState<Issue | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [localIssues, setLocalIssues] = React.useState<Issue[]>([]);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = React.useState<boolean>(false);
  const [hasPendingOperations, setHasPendingOperations] = React.useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Issue | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string>("Задача обновлена");

  const board = boards?.find(b => b.id === boardId);
  
  // Фильтрация и подготовка задач для текущей доски
  const boardTasks = React.useMemo(() => allTasks?.filter(t => t.boardId === boardId) || [], [allTasks, boardId]);
  const boardIssues = React.useMemo(() => {
    if (boardTasks.length === 0 && localIssues.length === 0) return [];
    if (localIssues.length === 0) return boardTasks;
    return [...boardTasks, ...localIssues];
  }, [boardTasks, localIssues]);

  // Эффект для автоматического открытия задачи при наличии issueId в URL
  useEffect(() => {
    if (issueIdFromUrl && boardTasks) {
      const issueId = parseInt(issueIdFromUrl, 10);
      const foundIssue = boardTasks.find(task => task.id === issueId);
      
      if (foundIssue) {
        setSelected(foundIssue);
        setModalOpen(true);
      }
    }
  }, [issueIdFromUrl, boardTasks]);

  const handleIssueClick = (issue: Issue) => {
    setSelected(issue);
    setModalOpen(true);
    
    // Обновляем URL без перезагрузки страницы для возможности поделиться ссылкой
    navigate(`/board/${boardId}?issueId=${issue.id}`, { replace: true });
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelected(null);
    
    // Удаляем параметр issueId из URL при закрытии модалки
    navigate(`/board/${boardId}`, { replace: true });
  };

  const handleModalSave = () => {
    setModalOpen(false);
    setSelected(null);
    navigate(`/board/${boardId}`, { replace: true });
    refetchTasks(); // Обновляем задачи после сохранения
  };

  const handleStatusChange = (issueId: number | string, newStatus: string, newPriority?: string) => {
    console.log(`Updating task ${issueId} ${newPriority ? 'priority to ' + newPriority : 'status to ' + newStatus}`);
    setHasPendingOperations(true);
    
    // Обработка изменения приоритета задачи
    if (newPriority) {
      updatePriority([issueId, newPriority], {
        onSuccess: () => {
          // Формируем текст уведомления о приоритете
          const priorityText = newPriority === 'High' ? 'Высокий' : 
                             newPriority === 'Medium' ? 'Средний' : 'Низкий';
          setActionMessage(`Приоритет задачи изменен на "${priorityText}"`);
          setStatusUpdateSuccess(true);
          setTimeout(() => setStatusUpdateSuccess(false), 1500);
          refetchTasks();
        },
        onError: (error) => {
          console.error('Ошибка при обновлении приоритета задачи:', error);
        },
        onSettled: () => {
          setHasPendingOperations(false);
        }
      });
    }
    
    // Обработка изменения статуса задачи
    if (newStatus) {
      updateStatus([issueId, newStatus], {
        onSuccess: () => {
          // Формируем текст уведомления о статусе
          const statusText = newStatus === 'Backlog' ? 'К выполнению' : 
                           newStatus === 'InProgress' ? 'В работе' : 'Готово';
          setActionMessage(`Статус задачи изменен на "${statusText}"`);
          setStatusUpdateSuccess(true);
          setTimeout(() => setStatusUpdateSuccess(false), 1500);
          refetchTasks();
        },
        onError: (error) => {
          console.error('Ошибка при обновлении статуса задачи:', error);
        },
        onSettled: () => {
          setHasPendingOperations(false);
        }
      });
    }
  };

  // Инициализирует удаление по issueId с подтверждением
  const handleDelete = (issueId: number) => {
    // Находим задачу по ID для отображения имени
    const targetIssue = boardIssues.find(i => i.id === issueId) || { id: issueId, title: `Задача #${issueId}` };
    setDeleteTarget(targetIssue);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setHasPendingOperations(true);
    deleteTask(deleteTarget.id, {
      onSuccess: () => {
        setLocalIssues(prev => prev.filter(issue => issue.id !== deleteTarget.id));
        refetchTasks(); // Обновляем список задач после успешного удаления
      },
      onError: (error) => {
        console.error('Error deleting task:', error);
      },
      onSettled: () => {
        setHasPendingOperations(false);
        setDeleteConfirmOpen(false);
        setDeleteTarget(null);
      }
    });
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  const handleCreate = (issue: Issue) => {
    setLocalIssues(prev => [issue, ...prev]);
    setCreateOpen(false);
    refetchTasks(); // Обновляем список задач после создания новой задачи
  };

  // Обработчик принудительного обновления данных
  const handleRefresh = () => {
    setIsRefreshing(true);
    refetchTasks().finally(() => {
      setIsRefreshing(false);
    });
  };

  if (isBoardsLoading || isTasksLoading) {
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
          Загрузка доски...
        </Typography>
      </Container>
    );
  }
  
  if (!board) return (
    <Container sx={{ mt: 4 }}>
      <Alert severity="info">Доска не найдена или сервер недоступен. Проверьте запуск backend.</Alert>
    </Container>
  );

  return (
    <Box 
      sx={{ 
        height: 'calc(100vh - 64px)', // Высота экрана минус высота AppBar
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' // Важно для предотвращения вложенных скроллящихся контейнеров
      }}
      ref={containerRef}
    >
      {/* Заголовок и кнопки, они не скроллятся */}
      <Paper 
        sx={{ 
          px: 3,
          py: 2,
          mb: 2,
          borderRadius: 2,
          boxShadow: theme.shadows[2],
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        }}
        elevation={1}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {board.name}
            </Typography>
            {board.description && (
              <Typography variant="body2" color="text.secondary">
                {board.description}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Tooltip title="Обновить">
              <motion.div whileHover={{ rotate: 180, scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </motion.div>
            </Tooltip>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateOpen(true)}
                sx={{
                  transition: theme.transitions.create(['transform', 'box-shadow'], {
                    duration: theme.transitions.duration.short
                  }),
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4
                  }
                }}
              >
                Создать задачу
              </Button>
            </motion.div>
          </Box>
        </Box>
        
        {/* Прогресс-бар для операций */}
        {hasPendingOperations && (
          <LinearProgress 
            sx={{ 
              mt: 2, 
              borderRadius: 1,
              height: 4
            }}
          />
        )}
        
        {/* Количество задач на доске */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            icon={<DashboardCustomizeIcon fontSize="small" />}
            label={`Всего задач: ${boardIssues?.length || 0}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'medium' }}
          />
          
          {/* Группировка по статусам */}
          {['Backlog', 'InProgress', 'Done'].map(status => {
            const count = boardIssues?.filter(issue => issue.status === status).length || 0;
            const color = status === 'Backlog' ? 'info' : status === 'InProgress' ? 'warning' : 'success';
            const label = status === 'Backlog' ? 'К выполнению' : status === 'InProgress' ? 'В работе' : 'Готово';
            
            return (
              <Chip 
                key={status}
                label={`${label}: ${count}`}
                color={color as any}
                size="small"
                variant={count > 0 ? "default" : "outlined"}
                sx={{ opacity: count > 0 ? 1 : 0.7 }}
              />
            );
          })}
        </Box>
      </Paper>
      
      {/* Контейнер для KanbanBoard, который занимает все доступное пространство и скроллится */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'auto',  // Только этот контейнер должен скроллиться
          px: 3,
          pb: 4
        }}
      >
        <KanbanBoard
          issues={boardIssues}
          onIssueClick={handleIssueClick}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          isDeleting={hasPendingOperations}
          deleteSuccess={statusUpdateSuccess}
          board={{ id: board.id, name: board.name }}
        />
      </Box>
      
      {/* Снекбар с уведомлением об успешном обновлении статуса */}
      <Snackbar
        open={statusUpdateSuccess}
        autoHideDuration={1500}
        onClose={() => setStatusUpdateSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setStatusUpdateSuccess(false)}
          sx={{ width: '100%' }}
        >
          {actionMessage}
        </Alert>
      </Snackbar>
      
      {/* Модальные окна */}
      <IssueModal
        open={modalOpen}
        issue={selected}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
      
      <CreateIssueModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        boardId={id}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={cancelDelete}>
        <DialogTitle>Удалить задачу?</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить задачу "{deleteTarget?.title}"? Это действие нельзя отменить.
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Отмена</Button>
          <Button color="error" onClick={confirmDelete}>Удалить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BoardPage;
