import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button } from '@mui/material';
import { useCreateBoard, useUpdateBoard } from '@/shared/hooks/useBoards';
import type { Board } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  board?: Board;
}

const BoardModal: React.FC<Props> = ({ open, onClose, board }) => {
  const [name, setName] = useState(board?.name || '');
  const create = useCreateBoard();
  const update = useUpdateBoard();

  useEffect(() => {
    if (board) setName(board.name);
  }, [board]);

  const onSave = () => {
    if (board) {
      update.mutate({ id: board.id, data: { name } }, { onSuccess: onClose });
    } else {
      create.mutate({ name }, { onSuccess: onClose });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box p={2} bgcolor="white" mx="auto" mt="10%" width={400}>
        <TextField
          fullWidth
          label="Название доски"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Button variant="contained" onClick={onSave} sx={{ mt: 2 }}>
          Сохранить
        </Button>
      </Box>
    </Modal>
  );
};

export default BoardModal;