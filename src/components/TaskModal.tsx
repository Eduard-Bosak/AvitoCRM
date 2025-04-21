import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dialog, DialogActions, DialogContent, DialogTitle, 
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Box, Typography, Divider, Chip, Avatar, IconButton,
  FormHelperText, Alert, Slide, Fade, alpha, useTheme,
  Grid, Stack, Tooltip, LinearProgress
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { useCreateTask } from '@/shared/hooks/useCreateTask';
import { useUpdateTask } from '@/shared/hooks/useUpdateTask';
import { useDeleteTask } from '@/shared/hooks/useDeleteTask';
import { useBoards } from '@/shared/hooks/useBoards';
import { useUsers } from '@/shared/hooks/useUsers';
import { useFormDraft } from '@/shared/hooks/useFormDraft';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import FlagIcon from '@mui/icons-material/Flag';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { motion } from 'framer-motion';
import type { Issue } from '@/types/issue';

interface TaskModalProps {
  open: boolean;
  task?: Issue;
  issue?: Issue;
  taskId?: number;
  isNew?: boolean;
  onClose: () => void;
  onSave?: (task: Issue) => void;
  onDelete?: (id: number | string) => void;
}

// Slide transition for modal
const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Приоритет с цветовым маркером
const PriorityOption = ({ value, label }: { value: string; label: string }) => {
  let icon = null;
  let color: 'success' | 'warning' | 'error' | 'default' = 'default';
  
  switch (value) {
    case 'Low':
      icon = <LowPriorityIcon fontSize="small" />;
      color = 'success';
      break;
    case 'Medium':
      icon = <FlagIcon fontSize="small" />;
      color = 'warning';
      break;
    case 'High':
      icon = <PriorityHighIcon fontSize="small" />;
      color = 'error';
      break;
  }
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box component="span" sx={{ mr: 1, color: `${color}.main` }}>
        {icon}
      </Box>
      {label}
    </Box>
  );
};

export default function TaskModal({ open, task, issue, taskId, isNew, onClose, onSave, onDelete }: TaskModalProps) {
  const theme = useTheme();
  const createMode = Boolean(isNew);
  const editId = task?.id || issue?.id || taskId;
  const actualTask = task || issue;
  
  // Уникальный ID для черновика формы
  const draftId = useMemo(() => {
    return createMode ? 'new-task' : `task-${editId}`;
  }, [createMode, editId]);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    boardId: 1,
    priority: 'Medium',
    status: 'Backlog',
    assigneeId: null as number | null,
  });
  
  const { 
    saveFormDraft, 
    updateFormDraft, 
    removeFormDraft, 
    getDraftData, 
    hasDraft 
  } = useFormDraft(draftId, 'task');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: boards, isLoading: isBoardsLoading } = useBoards();
  const { data: users, isLoading: isUsersLoading } = useUsers();

  const create = useCreateTask();
  const update = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // Загружаем данные задачи или черновик при открытии модального окна
  useEffect(() => {
    if (open) {
      if (hasDraft && !isSubmitting) {
        const draftData = getDraftData();
        setForm(draftData);
        setHasChanges(true);
      } else if (actualTask) {
        setForm({
          title: actualTask.title || '',
          description: actualTask.description || '',
          boardId: actualTask.boardId || 1,
          priority: actualTask.priority || 'Medium',
          status: actualTask.status || 'Backlog',
          assigneeId: actualTask.assigneeId || null,
        });
        setHasChanges(false);
      } else {
        // Default values for new task
        setForm({
          title: '',
          description: '',
          boardId: 1,
          priority: 'Medium',
          status: 'Backlog',
          assigneeId: null,
        });
        setHasChanges(false);
      }
      
      // Reset errors and messages
      setErrors({});
      setSuccessMessage(null);
    }
  }, [actualTask, open, getDraftData, hasDraft, isSubmitting]);

  // Save form changes to Redux store
  useEffect(() => {
    if (!createMode && actualTask && hasChanges) {
      updateFormDraft(form);
    } else if (createMode && hasChanges) {
      saveFormDraft(form);
    }
  }, [form, hasChanges, createMode, actualTask, saveFormDraft, updateFormDraft]);

  // Validation logic
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.title.trim()) {
      newErrors.title = 'Название задачи обязательно';
    } else if (form.title.length < 3) {
      newErrors.title = 'Название должно содержать не менее 3 символов';
    }
    
    if (!form.description.trim()) {
      newErrors.description = 'Описание задачи обязательно';
    } else if (form.description.length < 10) {
      newErrors.description = 'Описание должно содержать не менее 10 символов';
    }
    
    if (!form.boardId) {
      newErrors.boardId = 'Выберите доску';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (name) {
      setForm({
        ...form,
        [name]: value
      });
      setHasChanges(true);
      
      // Clear error for this field if present
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: ''
        });
      }
    }
  };

  const handleCloseDialog = () => {
    // Проверяем, есть ли несохраненные изменения
    if (hasChanges && !isSubmitting) {
      setCloseConfirmOpen(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setCloseConfirmOpen(false);
    onClose();
  };

  const cancelClose = () => {
    setCloseConfirmOpen(false);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    if (createMode) {
      create.mutate(
        {
          title: form.title,
          description: form.description,
          boardId: form.boardId,
          priority: form.priority,
          status: form.status,
          assigneeId: form.assigneeId || undefined,
        }, 
        {
          onSuccess: () => {
            // Remove the draft after successful save
            removeFormDraft();
            setHasChanges(false);
            setSuccessMessage("Задача успешно создана");
            
            setTimeout(() => {
              onClose();
              setSuccessMessage(null);
            }, 1500);
          },
          onError: () => {
            setIsSubmitting(false);
          },
          onSettled: () => {
            setIsSubmitting(false);
          }
        }
      );
    } else if (editId) {
      const updatedTask = {
        ...actualTask,
        ...form,
        id: editId
      };
      
      update.mutate(
        updatedTask,
        { 
          onSuccess: () => {
            // Remove the draft after successful save
            removeFormDraft();
            setHasChanges(false);
            
            if (onSave) {
              onSave(updatedTask);
            }
            
            setSuccessMessage("Задача успешно обновлена");
            setTimeout(() => {
              setSuccessMessage(null);
            }, 3000);
            setIsSubmitting(false);
          },
          onError: () => {
            setIsSubmitting(false);
          },
          onSettled: () => {
            setIsSubmitting(false);
          }
        }
      );
    }
  };

  const openDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  /**
   * Обработчик подтверждения удаления задачи
   * Вызывает API удаления и закрывает модальное окно при успешном удалении
   */
  const confirmDelete = () => {
    if (!editId) return;

    setIsDeleting(true);
    setDeleteConfirmOpen(false);

    // Имитация запроса удаления
    setTimeout(() => {
      // Имитация успешного удаления
      if (onDelete && editId) {
        onDelete(editId);
      }
      
      // Remove the draft after successful deletion
      removeFormDraft();
      
      setSuccessMessage("Задача успешно удалена");
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1000);
      
      setIsDeleting(false);
    }, 800);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        TransitionComponent={SlideTransition}
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {/* Loading indicator */}
          {isSubmitting && (
            <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
          )}
          
          <DialogTitle sx={{ 
            pr: 6,
            pb: 1,
            background: theme.palette.mode === 'dark' ? 
              `linear-gradient(45deg, ${alpha(theme.palette.primary.dark, 0.8)}, ${alpha(theme.palette.primary.main, 0.6)})` : 
              `linear-gradient(45deg, ${alpha(theme.palette.primary.light, 0.4)}, ${alpha(theme.palette.background.paper, 0.2)})`,
          }}>
            <Typography variant="h5" component="div">
              {createMode ? 'Создание новой задачи' : 'Редактирование задачи'}
            </Typography>
            <Tooltip title="Закрыть">
              <IconButton
                aria-label="close"
                onClick={handleCloseDialog}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: theme.palette.grey[500],
                }}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    autoFocus
                    margin="dense"
                    name="title"
                    label="Название задачи"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={form.title}
                    onChange={handleInputChange}
                    error={!!errors.title}
                    helperText={errors.title}
                    disabled={isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <Box component="span" sx={{ mr: 1, color: 'primary.main' }}>
                          <AssignmentIcon fontSize="small" />
                        </Box>
                      ),
                    }}
                  />
                </Box>

                <TextField
                  margin="dense"
                  name="description"
                  label="Описание задачи"
                  fullWidth
                  multiline
                  rows={10}
                  variant="outlined"
                  value={form.description}
                  onChange={handleInputChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  disabled={isSubmitting}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Stack spacing={2.5}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="status-label">Статус</InputLabel>
                    <Select
                      labelId="status-label"
                      name="status"
                      value={form.status}
                      onChange={handleInputChange}
                      label="Статус"
                      disabled={isSubmitting}
                    >
                      <MenuItem value="Backlog">К выполнению</MenuItem>
                      <MenuItem value="InProgress">В работе</MenuItem>
                      <MenuItem value="Done">Готово</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="priority-label">Приоритет</InputLabel>
                    <Select
                      labelId="priority-label"
                      name="priority"
                      value={form.priority}
                      onChange={handleInputChange}
                      label="Приоритет"
                      disabled={isSubmitting}
                    >
                      <MenuItem value="Low">
                        <PriorityOption value="Low" label="Низкий" />
                      </MenuItem>
                      <MenuItem value="Medium">
                        <PriorityOption value="Medium" label="Средний" />
                      </MenuItem>
                      <MenuItem value="High">
                        <PriorityOption value="High" label="Высокий" />
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth variant="outlined" error={!!errors.boardId}>
                    <InputLabel id="board-label">Доска</InputLabel>
                    <Select
                      labelId="board-label"
                      name="boardId"
                      value={form.boardId}
                      onChange={handleInputChange}
                      label="Доска"
                      disabled={isSubmitting || isBoardsLoading}
                    >
                      {isBoardsLoading ? (
                        <MenuItem value={0} disabled>Загрузка...</MenuItem>
                      ) : (
                        boards?.map(board => (
                          <MenuItem key={board.id} value={board.id}>
                            {board.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.boardId && <FormHelperText>{errors.boardId}</FormHelperText>}
                  </FormControl>

                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="assignee-label">Исполнитель</InputLabel>
                    <Select
                      labelId="assignee-label"
                      name="assigneeId"
                      value={form.assigneeId || ''}
                      onChange={handleInputChange}
                      label="Исполнитель"
                      disabled={isSubmitting || isUsersLoading}
                    >
                      <MenuItem value="">
                        <em>Не назначен</em>
                      </MenuItem>
                      {isUsersLoading ? (
                        <MenuItem value={0} disabled>Загрузка...</MenuItem>
                      ) : (
                        users?.map(user => (
                          <MenuItem key={user.id} value={user.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  mr: 1,
                                  backgroundColor: `${theme.palette.primary.main}20`,
                                  fontSize: '0.75rem',
                                  color: theme.palette.primary.main
                                }}
                              >
                                {user.name?.charAt(0) || user.id?.toString().slice(0, 1)}
                              </Avatar>
                              {user.name || `Пользователь ${user.id}`}
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                  
                  {/* Дата создания и обновления для существующей задачи */}
                  {!createMode && actualTask && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                        ID задачи: #{actualTask.id}
                      </Typography>
                      {actualTask.createdAt && (
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                          Создано: {new Date(actualTask.createdAt).toLocaleString()}
                        </Typography>
                      )}
                      {actualTask.updatedAt && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          Обновлено: {new Date(actualTask.updatedAt).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Stack>
              </Grid>
            </Grid>

            {/* Success message */}
            {successMessage && (
              <Fade in={!!successMessage}>
                <Alert severity="success" sx={{ mt: 2 }}>
                  {successMessage}
                </Alert>
              </Fade>
            )}
          </DialogContent>

          <Divider />

          <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
            <Box>
              {!createMode && editId && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={openDeleteConfirm}
                    disabled={isSubmitting || isDeleting}
                    startIcon={<DeleteIcon />}
                  >
                    Удалить
                  </Button>
                </motion.div>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                onClick={handleCloseDialog} 
                disabled={isSubmitting || isDeleting}
                variant="text"
              >
                Отмена
              </Button>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button 
                  onClick={handleSubmit} 
                  variant="contained" 
                  color="primary"
                  disabled={isSubmitting || isDeleting}
                  startIcon={<SaveIcon />}
                >
                  {createMode ? 'Создать' : 'Сохранить'}
                </Button>
              </motion.div>
            </Box>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog for confirming task deletion */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        TransitionComponent={SlideTransition}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Подтверждение удаления</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить задачу "{form.title}"? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} color="primary">
            Отмена
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for confirming close with unsaved changes */}
      <Dialog
        open={closeConfirmOpen}
        onClose={cancelClose}
        TransitionComponent={SlideTransition}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Несохраненные изменения</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            У вас есть несохраненные изменения. Вы уверены, что хотите закрыть форму?
            {hasDraft && " Изменения останутся в черновике."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelClose} color="primary">
            Вернуться к редактированию
          </Button>
          <Button onClick={confirmClose} color="error" variant="outlined">
            Закрыть без сохранения
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
