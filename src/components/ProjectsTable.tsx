import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React from 'react';
import { Board } from '@/types/board';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Название', flex: 1 },
  { field: 'description', headerName: 'Описание', flex: 1 },
  { field: 'taskCount', headerName: 'Количество задач', width: 150 },
];

/**
 * Компонент для отображения проектов в виде таблицы
 * Использует данные досок (boards) как проекты
 */
export default function ProjectsTable({ rows }: { rows: Board[] }) {
  return <DataGrid 
    rows={rows} 
    columns={columns} 
    autoHeight 
    initialState={{
      pagination: {
        paginationModel: { pageSize: 10 }
      },
    }}
    pageSizeOptions={[5, 10, 25]}
  />;
}
