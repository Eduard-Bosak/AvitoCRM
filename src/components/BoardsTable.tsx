import React from 'react';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Board } from '../shared/api/types';
import { useNavigate } from 'react-router-dom';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Название', flex: 1 },
  { field: 'description', headerName: 'Описание', flex: 1 },
  { field: 'taskCount', headerName: 'Задач', width: 100 },
];

/**
 * Компонент таблицы досок с возможностью перехода на страницу доски
 * при клике на строку таблицы
 */
export default function BoardsTable({ boards }: { boards: Board[] }) {
  const navigate = useNavigate();

  const handleRowClick = (params: GridRowParams) => {
    navigate(`/board/${params.id}`);
  };

  return (
    <DataGrid 
      rows={boards} 
      columns={columns} 
      autoHeight 
      onRowClick={handleRowClick}
      sx={{ 
        cursor: 'pointer',
        '& .MuiDataGrid-row:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)'
        }
      }}
    />
  );
}
