import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl, 
  Stack, 
  Avatar, 
  Typography, 
  Autocomplete, 
  Alert,
  Box,
  Link,
  IconButton,
  Tooltip,
  DialogContentText
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import DeleteIcon from '@mui/icons-material/Delete';
import { Issue, User, PRIORITY_LABELS, STATUS_LABELS } from '../types/issue';
import { useUpdateTask } from '@/shared/hooks/useUpdateTask'; // Fixed import path
import { useDeleteTask } from '@/shared/hooks/useDeleteTask';
import { useUsers } from '@/shared/hooks/useUsers'; // Updated for consistency
import { useFormDraft } from '@/shared/hooks/useFormDraft';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

interface IssueModalProps {
  open: boolean;
  issue: Issue | null;
  onClose: () => void;
  onSave: (updated: Issue) => void;
  onDelete?: (issueId: number | string) => void;
  isNew?: boolean;
}

/**
 * Модальное окно для просмотра и редактирования задачи
 * С поддержкой сохранения черновиков через Redux
 */
const IssueModal: React.FC<IssueModalProps> = ({ 
  open, 
  issue, 
  onClose, 
  onSave, 
  onDelete, 
  isNew 
}) => {
  // Generate a draft ID based on the issue ID or a new one if creating
  const draftId = isNew 
    ? `new_issue_${uuidv4()}` 
    : `issue_${issue?.id}`;
  
  // Use our custom hook for form draft persistence
  const { 
    saveFormDraft, 
    updateFormDraft, 
    removeFormDraft, 
    getDraftData, 
    hasDraft 
  } = useFormDraft(draftId, 'issue');
  
  const [form, setForm] = useState<Issue | null>(issue);
  const [hasChanges, setHasChanges] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { mutate, isLoading } = useUpdateTask();
  const { mutate: deleteTask, isLoading: isDeleting } = useDeleteTask();
  const { data: users = [] as User[] } = useUsers();
  const navigate = useNavigate();

  // Load form from issue or draft when modal opens
  useEffect(() => {
    if (open && issue) {
      // Check for draft data
      const draftData = getDraftData();
      
      if (draftData) {
        // Use draft data if available
        setForm(draftData as Issue);
        setHasChanges(true);
      } else {
        // Otherwise use the actual issue data
        setForm(issue);
        setHasChanges(false);
      }
    }
  }, [issue, open, getDraftData]);

  // Save form changes to Redux store
  useEffect(() => {
    if (form && hasChanges && open) {
      updateFormDraft(form);
    }
  }, [form, hasChanges, open, updateFormDraft]);

  if (!form) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => prev ? { ...prev, [name]: value } : prev);
    setHasChanges(true);
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setForm(prev => prev ? { ...prev, [name]: value } : prev);
    setHasChanges(true);
  };

  const handleAssigneeChange = (_: any, value: User | null) => {
    setForm(prev => prev ? { ...prev, assignee: value || undefined } : prev);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (form) {
      if (isNew) {
        onSave(form);
        removeFormDraft();
      } else {
        mutate(form, { 
          onSuccess: () => {
            // Remove draft after successful save
            removeFormDraft();
            setHasChanges(false);
            onSave(form);
          } 
        });
      }
    }
  };

  const handleClose = () => {
    // Draft is already saved in Redux through the useEffect
    onClose();
  };

  const discardDraft = () => {
    if (issue) {
      removeFormDraft();
      setForm(issue);
      setHasChanges(false);
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
   * Отправляет запрос API на удаление и закрывает модальное окно
   */
  const confirmDelete = () => {
    if (!form?.id) return;
    
    deleteTask(form.id, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
        removeFormDraft(); // Remove draft when the issue is deleted
        
        // Call the external delete handler
        if (onDelete) {
          onDelete(form.id);
        }
        onClose();
      },
      onError: (error) => {
        console.error('Error deleting task:', error);
        setDeleteConfirmOpen(false);
      }
    });
  };

  const isValid = (form.title || '').trim() !== '' && (form.description || '').trim() !== '';

  // Navigate to the board page
  const goToBoard = () => {
    if (form.boardId) {
      navigate(`/board/${form.boardId}`);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography variant="h6">{isNew ? 'Создать задачу' : form.title}</Typography>
            {hasChanges && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Имеются несохраненные изменения
              </Typography>
            )}
          </div>
          {!isNew && (
            <Tooltip title="Удалить задачу">
              <IconButton 
                edge="end" 
                color="error" 
                onClick={openDeleteConfirm}
                aria-label="delete"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Название"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              fullWidth
              required
              error={(form.title || '').trim() === ''}
              helperText={(form.title || '').trim() === '' ? 'Обязательное поле' : ''}
            />
            <TextField
              label="Описание"
              name="description"
              value={form.description || ''}
              onChange={handleInputChange}
              fullWidth
              multiline
              minRows={3}
              required
              error={(form.description || '').trim() === ''}
              helperText={(form.description || '').trim() === '' ? 'Обязательное поле' : ''}
            />
            <FormControl fullWidth>
              <InputLabel id="priority-label">Приоритет</InputLabel>
              <Select
                labelId="priority-label"
                name="priority"
                value={form.priority}
                label="Приоритет"
                onChange={handleSelectChange}
              >
                <MenuItem value="Low">{PRIORITY_LABELS.Low}</MenuItem>
                <MenuItem value="Medium">{PRIORITY_LABELS.Medium}</MenuItem>
                <MenuItem value="High">{PRIORITY_LABELS.High}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="status-label">Статус</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={form.status}
                label="Статус"
                onChange={handleSelectChange}
              >
                <MenuItem value="Backlog">{STATUS_LABELS.Backlog}</MenuItem>
                <MenuItem value="InProgress">{STATUS_LABELS.InProgress}</MenuItem>
                <MenuItem value="Done">{STATUS_LABELS.Done}</MenuItem>
              </Select>
            </FormControl>
            <Autocomplete
              value={form.assignee || null}
              onChange={handleAssigneeChange}
              options={users}
              getOptionLabel={(user) => user.fullName}
              renderOption={(props, user) => (
                <MenuItem {...props}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar 
                      src={user.avatarUrl} 
                      alt={user.fullName}
                      sx={{ width: 24, height: 24 }}
                    />
                    <Stack>
                      <Typography variant="body2">{user.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Stack>
                  </Stack>
                </MenuItem>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Исполнитель"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: form.assignee ? (
                      <Avatar 
                        src={form.assignee.avatarUrl} 
                        alt={form.assignee.fullName}
                        sx={{ width: 24, height: 24, mr: 1 }}
                      />
                    ) : null,
                  }}
                />
              )}
            />
            {!isNew && ('boardName' in form || form.boardId) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Доска: {form.boardName || `Доска #${form.boardId}`}
                  <Link 
                    component="button"
                    variant="body2"
                    onClick={goToBoard}
                    sx={{ ml: 1 }}
                  >
                    (Перейти)
                  </Link>
                </Typography>
              </Box>
            )}
            
            {hasChanges && (
              <Alert 
                severity="info" 
                sx={{ mt: 2 }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={discardDraft}
                  >
                    Сбросить
                  </Button>
                }
              >
                Изменения автоматически сохраняются как черновик
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Закрыть</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!isValid || isLoading}
          >
            {isNew ? 'Создать' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle component="div" id="alert-dialog-title">
          <Typography variant="h6">Удаление задачи</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Вы уверены, что хотите удалить задачу "{form.title}"? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} disabled={isDeleting}>
            Отмена
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            autoFocus
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IssueModal;
