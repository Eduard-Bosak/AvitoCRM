import React, { useState } from 'react';
import {
  Box, TextField, MenuItem, FormControl, InputLabel,
  Select, Chip, IconButton, useTheme, alpha, Grid,
  Button, Collapse, Typography, useMediaQuery, Tooltip,
  Paper, Badge, Divider
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FastForwardIcon from '@mui/icons-material/FastForward';
import TuneIcon from '@mui/icons-material/Tune';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';

export interface IssueFiltersProps {
  status: string;
  boardId: string;
  title: string;
  assignee: string;
  priority?: string;
  boardOptions: { id: string; name: string }[];
  onChange: (f: { status: string; boardId: string; title: string; assignee: string; priority?: string }) => void;
}

/**
 * Компонент для адаптивной фильтрации задач по различным параметрам
 * Поддерживает фильтрацию по статусу, приоритету, доске, названию и исполнителю
 * Адаптивно подстраивается под размер экрана - на маленьких экранах фильтры можно скрыть/показать
 * 
 * @param props - Параметры компонента фильтрации задач
 * @returns React компонент с интерфейсом фильтрации
 */
const IssueFilters: React.FC<IssueFiltersProps> = ({
  status, boardId, title, assignee, priority = '', boardOptions, onChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filtersExpanded, setFiltersExpanded] = useState(!isMobile);
  
  // Обработчик изменения текстовых полей
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ status, boardId, title, assignee, priority, [name]: value });
  };

  // Обработчик изменения выпадающих списков
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    onChange({ status, boardId, title, assignee, priority, [name]: value });
  };

  // Очистка всех фильтров
  const resetFilters = () => {
    onChange({ status: '', boardId: '', title: '', assignee: '', priority: '' });
  };

  // Сброс определенного фильтра
  const resetFilter = (filterName: keyof IssueFiltersProps) => {
    onChange({
      ...{ status, boardId, title, assignee, priority },
      [filterName]: ''
    });
  };

  // Переключение видимости фильтров на мобильных устройствах
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  // Преобразование статуса в читаемый вид
  const getStatusLabel = (statusValue: string): string => {
    switch (statusValue) {
      case 'Backlog': return 'К выполнению';
      case 'InProgress': return 'В работе';
      case 'Done': return 'Готово';
      default: return statusValue;
    }
  };

  // Преобразование приоритета в читаемый вид
  const getPriorityLabel = (priorityValue: string): string => {
    switch (priorityValue.toLowerCase()) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priorityValue;
    }
  };

  // Получение цвета для статуса
  const getStatusColor = (statusValue: string): 'info' | 'warning' | 'success' | 'default' => {
    switch (statusValue) {
      case 'Backlog': return 'info';
      case 'InProgress': return 'warning';
      case 'Done': return 'success';
      default: return 'default';
    }
  };

  // Получение цвета для приоритета
  const getPriorityColor = (priorityValue: string): 'error' | 'warning' | 'success' | 'default' => {
    switch (priorityValue.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Получение иконки для приоритета
  const getPriorityIcon = (priorityValue: string) => {
    switch (priorityValue.toLowerCase()) {
      case 'high': return <PriorityHighIcon fontSize="small" />;
      case 'medium': return <TrendingUpIcon fontSize="small" />;
      case 'low': return <FastForwardIcon fontSize="small" />;
      default: return null;
    }
  };

  // Проверяем, есть ли хотя бы один активный фильтр
  const hasActiveFilters = status !== '' || boardId !== '' || title !== '' || assignee !== '' || priority !== '';
  
  // Количество активных фильтров
  const activeFilterCount = [status, boardId, title, assignee, priority].filter(Boolean).length;

  // Получаем имя доски для отображения в чипе
  const getBoardName = (id: string) => {
    const board = boardOptions.find(b => b.id === id);
    return board ? board.name : id;
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Заголовок фильтров с индикатором активных фильтров и кнопкой сворачивания/разворачивания */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2,
          mb: 2,
          borderRadius: 2,
          backgroundColor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.6)
            : alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: filtersExpanded ? 2 : 0,
            pb: filtersExpanded ? 2 : 0,
            borderBottom: filtersExpanded ? `1px solid ${alpha(theme.palette.divider, 0.2)}` : 'none',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              badgeContent={activeFilterCount}
              color="primary"
              invisible={activeFilterCount === 0}
              sx={{ mr: 1.5 }}
            >
              <TuneIcon sx={{ color: theme.palette.primary.main }} />
            </Badge>
            <Typography variant="h6" component="span" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
              Фильтрация задач
            </Typography>
            <Chip
              label={activeFilterCount > 0 ? `${activeFilterCount} ${getFilterCountLabel(activeFilterCount)}` : 'Нет фильтров'}
              color={activeFilterCount > 0 ? "primary" : "default"}
              size="small"
              variant={activeFilterCount > 0 ? "filled" : "outlined"}
              sx={{ ml: 2, height: 26, fontSize: '0.75rem' }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {hasActiveFilters && (
              <Tooltip title="Сбросить все фильтры">
                <Button 
                  size="small" 
                  onClick={resetFilters}
                  startIcon={<CloseIcon fontSize="small" />}
                  sx={{ mr: 1, textTransform: 'none' }}
                >
                  Сбросить все
                </Button>
              </Tooltip>
            )}
            
            <Tooltip title={filtersExpanded ? "Свернуть фильтры" : "Развернуть фильтры"}>
              <IconButton 
                size="small" 
                onClick={toggleFilters} 
                sx={{ 
                  backgroundColor: theme.palette.action.hover,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  }
                }}
              >
                {filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Скрываемая секция с фильтрами */}
        <Collapse in={filtersExpanded} timeout="auto">
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(4, 1fr)' 
              }, 
              gap: 2, 
              mt: 0.5 
            }}
          >
            {/* Фильтр по статусу */}
            <Box>
              <FormControl fullWidth size="medium" variant="outlined">
                <InputLabel id="status-label">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>Статус задачи</Typography>
                  </Box>
                </InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={status}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>Статус задачи</Typography>
                    </Box>
                  }
                  onChange={handleSelectChange}
                  sx={{ 
                    borderRadius: 2,
                    minWidth: '200px',
                    height: '48px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: status ? alpha(theme.palette.primary.main, 0.5) : undefined,
                      borderWidth: status ? '2px' : '1px',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px'
                    }
                  }}
                  endAdornment={
                    status && (
                      <IconButton 
                        size="small" 
                        sx={{ mr: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          resetFilter('status');
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                  MenuProps={{
                    PaperProps: {
                      sx: { maxHeight: 300, width: 'auto', minWidth: 250 }
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>Все статусы</em>
                  </MenuItem>
                  <MenuItem value="Backlog">
                    <Chip 
                      label="К выполнению" 
                      size="small" 
                      color="info" 
                      variant="filled" 
                      sx={{ minWidth: 150, fontWeight: 500 }} 
                    />
                  </MenuItem>
                  <MenuItem value="InProgress">
                    <Chip 
                      label="В работе" 
                      size="small" 
                      color="warning" 
                      variant="filled" 
                      sx={{ minWidth: 150, fontWeight: 500 }} 
                    />
                  </MenuItem>
                  <MenuItem value="Done">
                    <Chip 
                      label="Готово" 
                      size="small" 
                      color="success" 
                      variant="filled" 
                      sx={{ minWidth: 150, fontWeight: 500 }} 
                    />
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {/* Фильтр по приоритету */}
            <Box>
              <FormControl fullWidth size="medium" variant="outlined">
                <InputLabel id="priority-label">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PriorityHighIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>Приоритет</Typography>
                  </Box>
                </InputLabel>
                <Select
                  labelId="priority-label"
                  name="priority"
                  value={priority}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PriorityHighIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>Приоритет</Typography>
                    </Box>
                  }
                  onChange={handleSelectChange}
                  sx={{ 
                    borderRadius: 2,
                    minWidth: '200px',
                    height: '48px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: priority ? alpha(theme.palette.primary.main, 0.5) : undefined,
                      borderWidth: priority ? '2px' : '1px',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px'
                    }
                  }}
                  endAdornment={
                    priority && (
                      <IconButton 
                        size="small" 
                        sx={{ mr: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          resetFilter('priority');
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                  MenuProps={{
                    PaperProps: {
                      sx: { maxHeight: 300, width: 'auto', minWidth: 250 }
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>Все приоритеты</em>
                  </MenuItem>
                  <MenuItem value="high">
                    <Chip 
                      label="Высокий" 
                      size="small" 
                      color="error" 
                      variant="outlined" 
                      icon={<PriorityHighIcon />} 
                      sx={{ minWidth: 150, fontWeight: 500 }} 
                    />
                  </MenuItem>
                  <MenuItem value="medium">
                    <Chip 
                      label="Средний" 
                      size="small" 
                      color="warning" 
                      variant="outlined" 
                      icon={<TrendingUpIcon />} 
                      sx={{ minWidth: 150, fontWeight: 500 }} 
                    />
                  </MenuItem>
                  <MenuItem value="low">
                    <Chip 
                      label="Низкий" 
                      size="small" 
                      color="success" 
                      variant="outlined" 
                      icon={<FastForwardIcon />} 
                      sx={{ minWidth: 150, fontWeight: 500 }} 
                    />
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Фильтр по доске */}
            <Box>
              <FormControl fullWidth size="medium" variant="outlined">
                <InputLabel id="board-label">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DashboardIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>Доска</Typography>
                  </Box>
                </InputLabel>
                <Select
                  labelId="board-label"
                  name="boardId"
                  value={boardId}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DashboardIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>Доска</Typography>
                    </Box>
                  }
                  onChange={handleSelectChange}
                  sx={{ 
                    borderRadius: 2,
                    minWidth: '200px',
                    height: '48px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: boardId ? alpha(theme.palette.primary.main, 0.5) : undefined,
                      borderWidth: boardId ? '2px' : '1px',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px'
                    }
                  }}
                  endAdornment={
                    boardId && (
                      <IconButton 
                        size="small" 
                        sx={{ mr: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          resetFilter('boardId');
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                  MenuProps={{
                    PaperProps: {
                      sx: { maxHeight: 300, width: 'auto', minWidth: 250 }
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>Все доски</em>
                  </MenuItem>
                  {boardOptions.map(b => (
                    <MenuItem key={b.id} value={b.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 150 }}>
                        <DashboardIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{b.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Поиск */}
            <Box>
              <FormControl fullWidth variant="outlined">
                <TextField
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SearchIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>Поиск задач</Typography>
                    </Box>
                  }
                  name="title"
                  value={title}
                  onChange={handleInputChange}
                  fullWidth
                  size="medium"
                  variant="outlined"
                  placeholder="Введите ключевые слова..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      height: '48px',
                      minWidth: '200px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: title ? alpha(theme.palette.primary.main, 0.5) : undefined,
                        borderWidth: title ? '2px' : '1px',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '2px'
                      }
                    }
                  }}
                  InputProps={{
                    endAdornment: title && (
                      <IconButton 
                        size="small" 
                        onClick={() => resetFilter('title')}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    ),
                    startAdornment: (
                      <SearchIcon fontSize="small" sx={{ ml: 0.5, mr: 1, opacity: 0.7 }} />
                    ),
                  }}
                />
              </FormControl>
            </Box>
            
            {/* Фильтр по исполнителю */}
            <Box sx={{ gridColumn: { xs: '1', sm: 'span 2', md: 'span 4' } }}>
              <TextField
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>Исполнитель</Typography>
                  </Box>
                }
                name="assignee"
                value={assignee}
                onChange={handleInputChange}
                fullWidth
                size="medium"
                placeholder="Имя исполнителя..."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    height: '48px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: assignee ? alpha(theme.palette.primary.main, 0.5) : undefined,
                      borderWidth: assignee ? '2px' : '1px',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px'
                    }
                  }
                }}
                InputProps={{
                  endAdornment: assignee && (
                    <IconButton 
                      size="small" 
                      onClick={() => resetFilter('assignee')}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                  startAdornment: (
                    <PersonIcon fontSize="small" sx={{ ml: 0.5, mr: 1, opacity: 0.7 }} />
                  ),
                }}
              />
            </Box>
          </Box>
        </Collapse>
      </Paper>
      
      {/* Индикатор активных фильтров */}
      {hasActiveFilters && (
        <Box 
          sx={{
            mt: 1,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.4),
            backdropFilter: 'blur(4px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <FilterListIcon sx={{ fontSize: '1rem', mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Активные фильтры:
            </Typography>
            <Button 
              size="small" 
              onClick={resetFilters} 
              sx={{ ml: 'auto', textTransform: 'none', fontSize: '0.75rem' }}
            >
              Сбросить все
            </Button>
          </Box>
          
          <Box 
            display="flex" 
            flexWrap="wrap"
            gap={1}
          >
            {status && (
              <Chip
                icon={<AssignmentIcon fontSize="small" />}
                label={`Статус: ${getStatusLabel(status)}`}
                color={getStatusColor(status)}
                size="small"
                variant="filled"
                onDelete={() => resetFilter('status')}
                deleteIcon={<CloseIcon fontSize="small" />}
                sx={{ 
                  borderRadius: 1.5,
                  fontWeight: 500,
                  '& .MuiChip-deleteIcon': {
                    color: 'inherit',
                    opacity: 0.7
                  }
                }}
              />
            )}
            
            {priority && (
              <Chip
                icon={getPriorityIcon(priority)}
                label={`Приоритет: ${getPriorityLabel(priority)}`}
                color={getPriorityColor(priority)}
                size="small"
                variant="filled"
                onDelete={() => resetFilter('priority')}
                deleteIcon={<CloseIcon fontSize="small" />}
                sx={{ 
                  borderRadius: 1.5,
                  fontWeight: 500,
                  '& .MuiChip-deleteIcon': {
                    color: 'inherit',
                    opacity: 0.7
                  }
                }}
              />
            )}
            
            {boardId && (
              <Chip
                icon={<DashboardIcon fontSize="small" />}
                label={`Доска: ${getBoardName(boardId)}`}
                color="primary"
                size="small"
                variant="filled"
                onDelete={() => resetFilter('boardId')}
                deleteIcon={<CloseIcon fontSize="small" />}
                sx={{ 
                  borderRadius: 1.5,
                  fontWeight: 500,
                  '& .MuiChip-deleteIcon': {
                    color: 'inherit',
                    opacity: 0.7
                  }
                }}
              />
            )}
            
            {title && (
              <Chip
                icon={<SearchIcon fontSize="small" />}
                label={`Поиск: "${title}"`}
                color="default"
                size="small"
                variant="filled"
                onDelete={() => resetFilter('title')}
                deleteIcon={<CloseIcon fontSize="small" />}
                sx={{ 
                  borderRadius: 1.5,
                  fontWeight: 500,
                  '& .MuiChip-deleteIcon': {
                    color: 'inherit',
                    opacity: 0.7
                  }
                }}
              />
            )}
            
            {assignee && (
              <Chip
                icon={<PersonIcon fontSize="small" />}
                label={`Исполнитель: ${assignee}`}
                color="secondary"
                size="small"
                variant="filled"
                onDelete={() => resetFilter('assignee')}
                deleteIcon={<CloseIcon fontSize="small" />}
                sx={{ 
                  borderRadius: 1.5,
                  fontWeight: 500,
                  '& .MuiChip-deleteIcon': {
                    color: 'inherit',
                    opacity: 0.7
                  }
                }}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Вспомогательная функция для правильного склонения числа фильтров
function getFilterCountLabel(count: number): string {
  if (count === 1) return 'фильтр';
  if (count >= 2 && count <= 4) return 'фильтра';
  return 'фильтров';
}

export default IssueFilters;
