import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import KanbanBoard from '../components/KanbanBoard';

vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Droppable: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Draggable: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('KanbanBoard', () => {
  const mockBoard = {
    id: '1',
    name: 'Test Board',
    columns: [
      { id: 'todo', title: 'To Do', tasks: [] },
      { id: 'in-progress', title: 'In Progress', tasks: [] },
      { id: 'done', title: 'Done', tasks: [] }
    ]
  };

  it('renders board columns', () => {
    renderWithProviders(<KanbanBoard board={mockBoard} />);
    
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});