import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  Box,
  Card, 
  CardContent, 
  CardActions, 
  Grid,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/shared/hooks/useProjects';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';

/**
 * Страница проектов отображает список проектов в виде карточек
 * с возможностью перехода к доске проекта
 */
export default function ProjectsPage() {
  const { data, isLoading, isError } = useProjects();
  const navigate = useNavigate();
  
  // Состояние для отображения создания нового проекта (в реальном приложении)
  const [showCreateProject, setShowCreateProject] = useState(false);

  if (isLoading) return <CircularProgress sx={{ m: 4 }} />;
  if (isError)
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        Ошибка загрузки проектов
      </Alert>
    );

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>Проекты</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setShowCreateProject(true)}
        >
          Новый проект
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {data?.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div" gutterBottom>
                  {project.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {project.description || 'Нет описания'}
                </Typography>
                <Chip 
                  label={`${project.taskCount} задач`} 
                  color={project.taskCount > 0 ? "primary" : "default"} 
                  size="small"
                />
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<VisibilityIcon />}
                  onClick={() => navigate(`/board/${project.id}`)}
                >
                  Открыть доску
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        
        {data?.length === 0 && (
          <Box sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Нет доступных проектов. Создайте новый проект.
            </Typography>
          </Box>
        )}
      </Grid>

      {/* В полной реализации здесь был бы компонент создания проекта */}
      {showCreateProject && (
        <Alert severity="info" sx={{ mt: 4 }}>
          Функциональность создания нового проекта требует отдельной реализации backend API
        </Alert>
      )}
    </Container>
  );
}
