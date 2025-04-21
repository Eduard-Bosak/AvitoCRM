import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, Avatar, Typography, Box, IconButton, 
  MenuItem, Select, SelectChangeEvent, FormControl, 
  TablePagination, LinearProgress, Tooltip, useTheme, alpha,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FlagIcon from '@mui/icons-material/Flag';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import { Issue } from '../types/issue';

interface IssuesTableProps {
  issues: Issue[];
  onIssueEdit?: (issue: Issue) => void;
  onIssueDelete?: (issue: Issue) => void; // Изменили тип параметра на issue: Issue
  onStatusChange?: (id: number | string, status: string) => void;
  onPriorityChange?: (id: number | string, priority: string) => void;
  onBoardClick?: (boardId: number, issueId?: number | string) => void; // Новый пропс для навигации на канбан-доску
  isLoading?: boolean;
  viewMode?: 'default' | 'compact' | 'superCompact'; // Вместо compact: boolean
}

/**
 * Компонент таблицы задач с возможностью изменения статуса и приоритета
 * Улучшенный стиль с зазорами между строками для лучшего восприятия
 * Добавлена возможность перехода на канбан-доску с соответствующей задачей
 */
const IssuesTable: React.FC<IssuesTableProps> = ({
  issues,
  onIssueEdit,
  onIssueDelete,
  onStatusChange,
  onPriorityChange,
  onBoardClick,
  isLoading = false,
  viewMode = 'default' // По умолчанию используем стандартный режим
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Обработчики пагинации
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Обработчик изменения статуса задачи с предотвращением всплытия события
  const handleStatusChange = (event: SelectChangeEvent<string>, issueId: number | string) => {
    event.stopPropagation();
    if (onStatusChange) {
      // Вызываем обработчик с новым статусом
      onStatusChange(issueId, event.target.value);
    }
  };

  // Обработчик изменения приоритета задачи с предотвращением всплытия события
  const handlePriorityChange = (event: SelectChangeEvent<string>, issueId: number | string) => {
    event.stopPropagation();
    if (onPriorityChange) {
      // Вызываем обработчик с новым приоритетом
      onPriorityChange(issueId, event.target.value);
    }
  };
  
  // Обработчик перехода на доску
  const handleGoToBoard = (e: React.MouseEvent, boardId: number, issueId: number | string) => {
    e.stopPropagation();
    if (onBoardClick) {
      onBoardClick(boardId, issueId);
    }
  };

  // Получение цвета чипа по приоритету
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'высокий':
        return 'error';
      case 'medium':
      case 'средний':
        return 'warning';
      case 'low':
      case 'низкий':
        return 'success';
      default:
        return 'default';
    }
  };

  // Получение цвета чипа по статусу
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'backlog':
        return 'info';
      case 'inprogress':
        return 'warning';
      case 'done':
        return 'success';
      default:
        return 'default';
    }
  };

  // Получение метки чипа по статусу
  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'backlog':
        return 'К выполнению';
      case 'inprogress':
        return 'В работе';
      case 'done':
        return 'Готово';
      default:
        return 'Неизвестно';
    }
  };
  
  // Получение иконки для статуса
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'backlog':
        return <FormatListBulletedIcon fontSize="small" />;
      case 'inprogress':
        return <PlayArrowIcon fontSize="small" />;
      case 'done':
        return <CheckCircleIcon fontSize="small" />;
      default:
        return null;
    }
  };
  
  // Получение иконки для приоритета
  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <PriorityHighIcon fontSize="small" />;
      case 'medium':
        return <FlagIcon fontSize="small" />;
      case 'low':
        return <LowPriorityIcon fontSize="small" />;
      default:
        return <FlagIcon fontSize="small" />;
    }
  };

  // Определяем настройки плотности для каждого режима
  const getDensityStyles = () => {
    switch (viewMode) {
      case 'superCompact': // Gmail-режим
        return {
          tableSize: 'small' as const,
          padding: '2px 8px',
          rowHeight: 36,
          fontSize: '0.8125rem',
          lineClamp: 1,
          fontWeight: 400,
          verticalPadding: 0,
          iconSize: 'small' as const
        };
      case 'compact':
        return {
          tableSize: 'small' as const,
          padding: '4px 16px',
          rowHeight: 48,
          fontSize: '0.875rem',
          lineClamp: 1,
          fontWeight: 500,
          verticalPadding: 1,
          iconSize: 'small' as const
        };
      default:
        return {
          tableSize: 'medium' as const,
          padding: '8px 16px',
          rowHeight: 64,
          fontSize: '0.9375rem',
          lineClamp: 2,
          fontWeight: 500,
          verticalPadding: 2,
          iconSize: 'medium' as const
        };
    }
  };
  
  const densityStyles = getDensityStyles();

  return (
    <Paper 
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }} 
      elevation={3}
    >
      {isLoading && <LinearProgress />}
      <TableContainer sx={{ maxHeight: 650 }}>
        <Table stickyHeader aria-label="таблица задач" sx={{ borderSpacing: '0 12px', borderCollapse: 'separate' }} size={densityStyles.tableSize}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                fontWeight: 600, 
                backgroundColor: theme.palette.background.paper,
                fontSize: densityStyles.fontSize
              }}>ID</TableCell>
              <TableCell sx={{ 
                fontWeight: 600, 
                backgroundColor: theme.palette.background.paper,
                fontSize: densityStyles.fontSize
              }}>Название</TableCell>
              <TableCell sx={{ 
                fontWeight: 600, 
                backgroundColor: theme.palette.background.paper,
                fontSize: densityStyles.fontSize
              }}>Статус</TableCell>
              <TableCell sx={{ 
                fontWeight: 600, 
                backgroundColor: theme.palette.background.paper,
                fontSize: densityStyles.fontSize
              }}>Приоритет</TableCell>
              <TableCell sx={{ 
                fontWeight: 600, 
                backgroundColor: theme.palette.background.paper,
                fontSize: densityStyles.fontSize
              }}>Исполнитель</TableCell>
              <TableCell sx={{ 
                fontWeight: 600, 
                backgroundColor: theme.palette.background.paper,
                fontSize: densityStyles.fontSize
              }}>Доска</TableCell>
              <TableCell sx={{ 
                fontWeight: 600, 
                backgroundColor: theme.palette.background.paper,
                fontSize: densityStyles.fontSize
              }} align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ '& .MuiTableRow-root': viewMode === 'compact' ? { '& .MuiTableCell-root': { py: 1 } } : {} }}>
            {(rowsPerPage > 0
              ? issues.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : issues
            ).map((issue) => (
              <TableRow 
                key={issue.id}
                sx={{ 
                  cursor: 'pointer',
                  my: 2,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: theme.transitions.create(['background-color', 'box-shadow'], {
                    duration: theme.transitions.duration.standard,
                  }),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }
                }}
                onClick={() => onIssueEdit && onIssueEdit(issue)}
              >
                <TableCell 
                  component="th" 
                  scope="row"
                  sx={{ 
                    borderTopLeftRadius: '8px',
                    borderBottomLeftRadius: '8px',
                    py: densityStyles.verticalPadding,
                    px: densityStyles.padding,
                    fontSize: densityStyles.fontSize,
                    fontWeight: densityStyles.fontWeight,
                    // Для Gmail-режима добавляем левую тонкую полосу показывающую приоритет
                    ...(viewMode === 'superCompact' && {
                      borderLeft: `3px solid ${
                        issue.priority === 'High' 
                          ? theme.palette.error.main 
                          : issue.priority === 'Medium'
                            ? theme.palette.warning.main
                            : theme.palette.success.main
                      }`,
                      pl: '12px'
                    })
                  }}
                >
                  <Typography 
                    fontWeight={500} 
                    sx={{ 
                      color: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: '4px',
                      px: 1,
                      py: 0.5,
                      display: 'inline-block',
                      fontSize: '0.8125rem'
                    }}
                  >
                    #{issue.id}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: densityStyles.verticalPadding, px: densityStyles.padding, fontSize: densityStyles.fontSize, fontWeight: densityStyles.fontWeight }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{issue.title}</Typography>
                    {issue.description && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          mt: 0.5
                        }}
                      >
                        {issue.description}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ py: densityStyles.verticalPadding, px: densityStyles.padding, fontSize: densityStyles.fontSize, fontWeight: densityStyles.fontWeight }}>
                  <FormControl 
                    variant="outlined" 
                    size="small" 
                    sx={{ 
                      minWidth: 150,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 4,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Select
                      value={issue.status || ''}
                      onChange={(e) => handleStatusChange(e, issue.id)}
                      displayEmpty
                      sx={{ 
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }}
                      renderValue={(value) => (
                        <Chip 
                          label={getStatusLabel(value as string)}
                          size="small" 
                          color={getStatusColor(value as string) as any}
                          variant="filled"
                          sx={{ 
                            height: 24, 
                            minWidth: 110,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: 1,
                            '& .MuiChip-label': { px: 1 }
                          }}
                          icon={getStatusIcon(value as string)}
                        />
                      )}
                    >
                      <MenuItem value="Backlog">
                        <Chip 
                          label="К выполнению" 
                          size="small" 
                          color="info" 
                          variant="filled" 
                          sx={{ 
                            minWidth: 110,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            borderRadius: 1
                          }} 
                          icon={<FormatListBulletedIcon fontSize="small" />}
                        />
                      </MenuItem>
                      <MenuItem value="InProgress">
                        <Chip 
                          label="В работе" 
                          size="small" 
                          color="warning" 
                          variant="filled" 
                          sx={{ 
                            minWidth: 110,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            borderRadius: 1
                          }} 
                          icon={<PlayArrowIcon fontSize="small" />}
                        />
                      </MenuItem>
                      <MenuItem value="Done">
                        <Chip 
                          label="Готово" 
                          size="small" 
                          color="success" 
                          variant="filled" 
                          sx={{ 
                            minWidth: 110,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            borderRadius: 1
                          }}
                          icon={<CheckCircleIcon fontSize="small" />}
                        />
                      </MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell sx={{ py: densityStyles.verticalPadding, px: densityStyles.padding, fontSize: densityStyles.fontSize, fontWeight: densityStyles.fontWeight }}>
                  <FormControl 
                    variant="outlined" 
                    size="small" 
                    sx={{ 
                      minWidth: 120,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 4,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Select
                      value={(issue.priority || 'medium').toLowerCase()}
                      onChange={(e) => handlePriorityChange(e, issue.id)}
                      displayEmpty
                      sx={{ 
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }}
                      renderValue={(value) => (
                        <Chip 
                          label={value === 'high' ? 'Высокий' : value === 'medium' ? 'Средний' : 'Низкий'} 
                          size="small" 
                          color={getPriorityColor(value as string) as any}
                          variant="outlined"
                          sx={{ 
                            height: 24,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: 1,
                            borderWidth: 1.5,
                            '& .MuiChip-label': { px: 1 }
                          }}
                          icon={getPriorityIcon(value as string)}
                        />
                      )}
                    >
                      <MenuItem value="high">
                        <Chip 
                          label="Высокий" 
                          size="small" 
                          color="error" 
                          variant="outlined" 
                          sx={{ 
                            minWidth: 80,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            borderRadius: 1,
                            borderWidth: 1.5
                          }}
                          icon={<PriorityHighIcon fontSize="small" />}
                        />
                      </MenuItem>
                      <MenuItem value="medium">
                        <Chip 
                          label="Средний" 
                          size="small" 
                          color="warning" 
                          variant="outlined" 
                          sx={{ 
                            minWidth: 80,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            borderRadius: 1,
                            borderWidth: 1.5
                          }}
                          icon={<FlagIcon fontSize="small" />}
                        />
                      </MenuItem>
                      <MenuItem value="low">
                        <Chip 
                          label="Низкий" 
                          size="small" 
                          color="success" 
                          variant="outlined" 
                          sx={{ 
                            minWidth: 80,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            borderRadius: 1,
                            borderWidth: 1.5
                          }}
                          icon={<LowPriorityIcon fontSize="small" />}
                        />
                      </MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell sx={{ py: densityStyles.verticalPadding, px: densityStyles.padding, fontSize: densityStyles.fontSize, fontWeight: densityStyles.fontWeight }}>
                  {issue.assignee ? (
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        src={issue.assignee.avatarUrl} 
                        alt={issue.assignee.fullName}
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          mr: 1,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                        }}
                      />
                      <Typography variant="body2">{issue.assignee.fullName}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Не назначен</Typography>
                  )}
                </TableCell>
                {/* Новая ячейка с кнопкой перехода на канбан-доску */}
                <TableCell sx={{ py: densityStyles.verticalPadding, px: densityStyles.padding, fontSize: densityStyles.fontSize, fontWeight: densityStyles.fontWeight }}>
                  {issue.boardId && (
                    <Tooltip title="Перейти на канбан-доску с этой задачей">
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<DashboardCustomizeIcon />}
                        onClick={(e) => handleGoToBoard(e, issue.boardId as number, issue.id)}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          px: 1.5,
                          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            borderColor: theme.palette.primary.main
                          }
                        }}
                      >
                        Канбан
                      </Button>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px',
                    py: densityStyles.verticalPadding,
                    px: densityStyles.padding,
                    fontSize: densityStyles.fontSize,
                    fontWeight: densityStyles.fontWeight
                  }}
                >
                  <Box 
                    display="flex" 
                    justifyContent="flex-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip title="Редактировать">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onIssueEdit) onIssueEdit(issue);
                        }}
                        sx={{
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.15),
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onIssueDelete) onIssueDelete(issue); // Передаем весь объект задачи
                        }}
                        sx={{
                          ml: 1,
                          backgroundColor: alpha(theme.palette.error.main, 0.05),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.15),
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={issues.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Строк на странице:"
      />
    </Paper>
  );
};

export default IssuesTable;
