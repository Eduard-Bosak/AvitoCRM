import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useBoards } from '@hooks/useBoards';
import { useTasks } from '@hooks/useTasks';

const Debug: React.FC = () => {
  const { data: boards, isLoading: boardsLoading, error: boardsError } = useBoards();
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useTasks();

  return (
    <Paper sx={{ p: 2, m: 2, bgcolor: '#fff' }}>
      <Typography variant="h6">Debug Info</Typography>
      <Box>
        <Typography>Boards Loading: {String(boardsLoading)}</Typography>
        <Typography>Boards Error: {boardsError?.message}</Typography>
        <Typography>Boards Data: {boards ? boards.length : 0} items</Typography>
        <Typography>Tasks Loading: {String(tasksLoading)}</Typography>
        <Typography>Tasks Error: {tasksError?.message}</Typography>
        <Typography>Tasks Data: {tasks ? tasks.length : 0} items</Typography>
      </Box>
    </Paper>
  );
};

export default Debug;