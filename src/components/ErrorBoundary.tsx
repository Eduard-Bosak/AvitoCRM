import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Alert, Button, Typography } from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle errors in React components
 * Prevents the entire application from crashing when an error occurs in a component tree
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ 
      error, 
      errorInfo 
    });
    
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback UI if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <Box sx={{ m: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Что-то пошло не так
          </Alert>
          <Typography variant="h6" gutterBottom>
            Произошла ошибка в компоненте
          </Typography>
          {error && (
            <Typography variant="body2" component="pre" sx={{ 
              p: 1,
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              overflowX: 'auto'
            }}>
              {error.toString()}
            </Typography>
          )}
          
          {process.env.NODE_ENV !== 'production' && errorInfo && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Стек вызовов:
              </Typography>
              <Typography variant="body2" component="pre" sx={{ 
                p: 1,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                overflowX: 'auto',
                maxHeight: '200px'
              }}>
                {errorInfo.componentStack}
              </Typography>
            </Box>
          )}
          
          <Button variant="contained" color="primary" onClick={this.handleReload} sx={{ mt: 2 }}>
            Перезагрузить страницу
          </Button>
        </Box>
      );
    }

    return children;
  }
}

export default ErrorBoundary;