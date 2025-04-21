import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField, 
  Button, 
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Typography,
  Alert,
  Box,
  CircularProgress,
  Snackbar,
  IconButton,
  useMediaQuery,
  useTheme,
  Tooltip
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask } from '@/shared/api/tasksApi';
import { useBoards } from '@/shared/hooks/useBoards';
import { useUsers } from '@/shared/hooks/useUsers';
import { Issue } from '@/types/issue';
import CloseIcon from '@mui/icons-material/Close';

// Ключ для сохранения черновика в localStorage
const DRAFT_STORAGE_KEY = 'task_form_draft';

interface TaskFormData {
  title: string;
  description: string;
  priority: string;
  status: string;
  assigneeId: string;
  boardId: string;
}

interface CreateIssueModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (issue: Issue) => void;
  boardId?: string; // Опциональный параметр доски, если компонент вызван со страницы доски
}

/**
 * Модальное окно создания новой задачи
 * С поддержкой сохранения черновиков в localStorage
 */
export default function CreateIssueModal({ 
  open, 
  onClose, 
  onCreate, 
  boardId 
}: CreateIssueModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Состояние для управления уведомлениями
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Получаем доски и пользователей для выпадающих списков
  const { data: boards, isLoading: isBoardsLoading } = useBoards();
  const { data: users, isLoading: isUsersLoading } = useUsers();
  
  // Настраиваем форму
  const { control, handleSubmit, reset, setValue, watch, formState: { errors, isValid, isDirty } } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Backlog',
      assigneeId: '',
      boardId: boardId || ''
    },
    mode: 'onChange' // Валидация при изменении полей
  });
  
  const qc = useQueryClient();
  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => createTask({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      assigneeId: Number(data.assigneeId) || undefined, // Если пустая строка, то undefined
      boardId: Number(data.boardId)
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['boardTasks'] });
      // Очищаем черновик при успешном создании
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setSuccessMsg('Задача успешно создана');
      setIsSubmitting(false);
    },
    onError: () => {
      setIsSubmitting(false);
    }
  });

  // Наблюдаем за изменениями формы для сохранения черновика
  const formValues = watch();
  
  // Загружаем черновик при открытии формы
  useEffect(() => {
    if (open) {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft) as TaskFormData;
          // Если открыли форму с конкретной доски, используем её ID, иначе из черновика
          const finalBoardId = boardId || draftData.boardId;
          
          // Заполняем форму данными из черновика
          Object.entries(draftData).forEach(([field, value]) => {
            setValue(field as keyof TaskFormData, field === 'boardId' ? finalBoardId : value);
          });
        } catch (e) {
          console.error('Error parsing draft data:', e);
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      } else if (boardId) {
        // Если открываем с конкретной доски, устанавливаем её ID
        setValue('boardId', boardId);
      }
    } else {
      // Сбрасываем состояния при закрытии
      setSuccessMsg(null);
      setIsSubmitting(false);
    }
  }, [open, setValue, boardId]);

  // Сохраняем черновик при изменении формы
  useEffect(() => {
    if (open && isDirty) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formValues));
    }
  }, [formValues, open, isDirty]);

  // Очищаем форму при закрытии
  const handleClose = () => {
    onClose();
  };

  const onSubmit = (data: TaskFormData) => {
    setIsSubmitting(true);
    // Если описание пустое, используем пустую строку вместо undefined
    const taskData = {
      ...data,
      description: data.description || ''
    };
    
    createTaskMutation.mutate(taskData, {
      onSuccess: (newTask) => {
        onCreate(newTask as unknown as Issue);
        reset(); // Сбрасываем форму
        handleClose();
      }
    });
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    reset(); // Сбрасываем форму к начальным значениям
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={isSubmitting ? undefined : handleClose} // Блокируем закрытие во время отправки
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { 
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          component="div" 
          sx={{ 
            pb: 1,
            display: 'flex',
            flexDirection: 'column',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Создание новой задачи</Typography>
            <IconButton 
              aria-label="close" 
              onClick={handleClose}
              disabled={isSubmitting}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Форма автоматически сохраняет черновик
          </Typography>
        </DialogTitle>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ pt: 3 }}>
            <Box component={Grid} container spacing={isMobile ? 2 : 3}>
              {/* Название задачи - на всю ширину */}
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Название задачи обязательно" }}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Название задачи *" 
                      fullWidth 
                      error={!!errors.title}
                      helperText={errors.title?.message || "Введите краткое описательное название"}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>
              
              {/* Описание задачи - на всю ширину */}
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Описание задачи (необязательно)" 
                      placeholder="Опишите задачу подробнее..."
                      fullWidth 
                      multiline 
                      rows={4}
                      disabled={isSubmitting}
                      helperText="Подробное описание поможет участникам команды быстрее понять суть задачи"
                    />
                  )}
                />
              </Grid>
              
              {/* Поля в две колонки - Приоритет и Статус */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="priority"
                  control={control}
                  rules={{ required: "Выберите приоритет" }}
                  render={({ field }) => (
                    <FormControl fullWidth disabled={isSubmitting}>
                      <InputLabel>Приоритет *</InputLabel>
                      <Select 
                        {...field} 
                        label="Приоритет *"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        <MenuItem value="Low">
                          <Box display="flex" alignItems="center" width="100%">
                            <Typography>Низкий</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="Medium">
                          <Box display="flex" alignItems="center" width="100%">
                            <Typography>Средний</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="High">
                          <Box display="flex" alignItems="center" width="100%">
                            <Typography>Высокий</Typography>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Выберите статус" }}
                  render={({ field }) => (
                    <FormControl fullWidth disabled={isSubmitting}>
                      <InputLabel>Статус *</InputLabel>
                      <Select 
                        {...field} 
                        label="Статус *"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        <MenuItem value="Backlog">
                          <Box display="flex" alignItems="center" width="100%">
                            <Typography>К выполнению</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="InProgress">
                          <Box display="flex" alignItems="center" width="100%">
                            <Typography>В работе</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="Done">
                          <Box display="flex" alignItems="center" width="100%">
                            <Typography>Готово</Typography>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              {/* Поля в две колонки - Исполнитель и Доска */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="assigneeId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth disabled={isSubmitting}>
                      <InputLabel>Исполнитель</InputLabel>
                      <Select 
                        {...field} 
                        label="Исполнитель"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        <MenuItem value="">
                          <Box display="flex" alignItems="center" width="100%">
                            <Typography>Не назначен</Typography>
                          </Box>
                        </MenuItem>
                        {users?.map(user => (
                          <MenuItem key={user.id} value={String(user.id)}>
                            <Box display="flex" alignItems="center" width="100%">
                              <Typography>{user.fullName}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                        Исполнителя можно назначить позже
                      </Typography>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="boardId"
                  control={control}
                  rules={{ required: "Доска обязательна" }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.boardId} disabled={isSubmitting || !!boardId}>
                      <InputLabel>Доска *</InputLabel>
                      <Select 
                        {...field} 
                        label="Доска *"
                        disabled={!!boardId || isSubmitting}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        {!boardId && (
                          <MenuItem value="">
                            <Box display="flex" alignItems="center" width="100%">
                              <Typography>Выберите доску</Typography>
                            </Box>
                          </MenuItem>
                        )}
                        {boards?.map(board => (
                          <MenuItem key={board.id} value={String(board.id)}>
                            <Box display="flex" alignItems="center" width="100%">
                              <Typography>{board.name}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.boardId ? (
                        <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1 }}>
                          {errors.boardId.message}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                          Выберите доску, к которой относится задача
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Box>
            
            {localStorage.getItem(DRAFT_STORAGE_KEY) && (
              <Alert 
                severity="info" 
                sx={{ mt: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={clearDraft} disabled={isSubmitting}>
                    Очистить
                  </Button>
                }
              >
                Форма содержит сохраненный черновик
              </Alert>
            )}
            
            {createTaskMutation.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Ошибка при создании задачи. Проверьте введенные данные и попробуйте еще раз.
              </Alert>
            )}

            {(isBoardsLoading || isUsersLoading) && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Загрузка данных...
                </Typography>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                * Обязательные поля
              </Typography>
              <Box>
                <Button 
                  onClick={handleClose} 
                  disabled={isSubmitting}
                  sx={{ mr: 1 }}
                >
                  Отмена
                </Button>
                <Tooltip title={!isValid ? "Заполните все обязательные поля" : ""}>
                  <span>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      disabled={isSubmitting || !isValid}
                      startIcon={isSubmitting && <CircularProgress size={16} color="inherit" />}
                    >
                      {isSubmitting ? 'Создание...' : 'Создать задачу'}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={!!successMsg}
        autoHideDuration={5000}
        onClose={() => setSuccessMsg(null)}
        message={successMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}
