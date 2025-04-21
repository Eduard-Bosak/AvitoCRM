import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import IssueModal from '../components/IssueModal';

vi.mock('@hooks/useUsers', () => ({
  useUsers: () => ({
    data: [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Smith' }
    ],
    isLoading: false
  })
}));

describe('IssueModal', () => {
  const mockIssue = {
    id: '1',
    title: 'Test Issue',
    description: 'Test Description',
    status: 'todo',
    assigneeId: '1'
  };

  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  it('renders issue details correctly', () => {
    renderWithProviders(
      <IssueModal 
        open={true} 
        issue={mockIssue}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByDisplayValue('Test Issue')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  it('calls onSave with updated values when save button is clicked', () => {
    renderWithProviders(
      <IssueModal 
        open={true} 
        issue={mockIssue}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const titleInput = screen.getByDisplayValue('Test Issue');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Updated Title'
    }));
  });
});