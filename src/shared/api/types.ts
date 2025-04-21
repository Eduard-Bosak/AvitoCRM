// Задача
export interface Issue {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Backlog' | 'InProgress' | 'Done';
  boardId: number;
  assigneeId?: number;
}

// Проект
export interface Project {
  id: number;
  name: string;
  description?: string;
}

// Доска
export interface Board {
  id: number;
  name: string;
  description?: string;
  taskCount?: number;
}
