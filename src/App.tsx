import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import IssuesPage from './pages/IssuesPage';
import ProjectsPage from './pages/ProjectsPage';
import BoardsPage from './pages/BoardsPage';
import BoardPage from './pages/BoardPage';
import KanbanPage from './pages/KanbanPage';
import FAQPage from './pages/FAQPage';
import { Box, Container } from '@mui/material';

export default function App() {
  return (
    <Box>
      <Header />
      <Container sx={{ mt: 2 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/boards" replace />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/boards" element={<BoardsPage />} />
          <Route path="/board/:id" element={<BoardPage />} />
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="/faq" element={<FAQPage />} />
        </Routes>
      </Container>
    </Box>
  );
}
