import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const TestComponent: React.FC = () => {
  const [count, setCount] = React.useState(0);

  return (
    <Box sx={{ p: 2, bgcolor: 'white' }}>
      <Typography variant="h4">Test Component</Typography>
      <Typography>Count: {count}</Typography>
      <Button 
        variant="contained" 
        onClick={() => setCount(prev => prev + 1)}
        sx={{ mt: 2 }}
      >
        Increment
      </Button>
    </Box>
  );
};

export default TestComponent;