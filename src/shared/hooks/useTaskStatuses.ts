import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { STATUS_LABELS, CustomStatus } from '../../types/issue';
import { api } from '../api/axios';

/**
 * Получение всех доступных статусов с сервера
 * Включает как стандартные статусы, так и пользовательские
 * @returns Промис со списком статусов задач
 */
const fetchTaskStatuses = async (): Promise<CustomStatus[]> => {
  try {
    // Пробуем получить статусы с сервера
    const { data } = await api.get('/statuses');
    return data.data || [];
  } catch (error) {
    console.warn('Не удалось получить статусы с сервера, используем локальные данные:', error);
    
    // В случае ошибки используем данные из localStorage для отказоустойчивости
    const savedStatuses = localStorage.getItem('customTaskStatuses');
    if (savedStatuses) {
      return JSON.parse(savedStatuses);
    }
    
    // Если в localStorage ничего нет, возвращаем стандартные статусы
    return [
      { key: 'Backlog', label: STATUS_LABELS.Backlog },
      { key: 'InProgress', label: STATUS_LABELS.InProgress },
      { key: 'Done', label: STATUS_LABELS.Done }
    ];
  }
};

/**
 * Создание нового статуса задачи
 * @param newStatus Данные нового статуса (ключ и метка)
 * @returns Промис с созданным статусом
 */
const createCustomStatus = async (newStatus: CustomStatus): Promise<CustomStatus> => {
  try {
    // Пытаемся создать статус через API
    const { data } = await api.post('/statuses/create', newStatus);
    
    // Кэшируем локально для отказоустойчивости
    const savedStatuses = localStorage.getItem('customTaskStatuses');
    const currentStatuses: CustomStatus[] = savedStatuses ? JSON.parse(savedStatuses) : [];
    const updatedStatuses = [...currentStatuses, newStatus];
    localStorage.setItem('customTaskStatuses', JSON.stringify(updatedStatuses));
    
    return data.data || newStatus;
  } catch (error) {
    console.warn('Не удалось создать статус через API, используем локальное хранилище:', error);
    
    // Если API не доступен, используем локальное хранилище
    const savedStatuses = localStorage.getItem('customTaskStatuses');
    const currentStatuses: CustomStatus[] = savedStatuses ? JSON.parse(savedStatuses) : [];
    const updatedStatuses = [...currentStatuses, newStatus];
    localStorage.setItem('customTaskStatuses', JSON.stringify(updatedStatuses));
    
    return newStatus;
  }
};

/**
 * Хук для работы со статусами задач
 * Предоставляет возможность получения всех статусов (стандартных и пользовательских)
 * и создания новых пользовательских статусов
 * 
 * @returns Объект с методами и данными для работы со статусами задач
 */
export function useTaskStatuses() {
  const queryClient = useQueryClient();
  const [allStatuses, setAllStatuses] = useState<CustomStatus[]>([
    { key: 'Backlog', label: STATUS_LABELS.Backlog },
    { key: 'InProgress', label: STATUS_LABELS.InProgress },
    { key: 'Done', label: STATUS_LABELS.Done },
  ]);

  // Запрос на получение всех статусов задач
  const { data: serverStatuses, isLoading, error } = useQuery({
    queryKey: ['taskStatuses'],
    queryFn: fetchTaskStatuses,
    retry: 2, // Повторить запрос дважды в случае ошибки
    staleTime: 1000 * 60 * 10, // Кеширование на 10 минут
  });
  
  // Мутация для создания нового пользовательского статуса
  const { mutate: addCustomStatus, isPending: isCreating } = useMutation({
    mutationFn: createCustomStatus,
    onSuccess: (newStatus) => {
      // Инвалидация кеша для обновления данных
      queryClient.invalidateQueries({ queryKey: ['taskStatuses'] });
      
      // Оптимистично обновляем список статусов
      setAllStatuses(prev => [...prev, newStatus]);
    },
    onError: (error) => {
      console.error('Ошибка при создании статуса:', error);
    }
  });

  // Обновляем список статусов при получении данных с сервера
  useEffect(() => {
    if (serverStatuses && serverStatuses.length > 0) {
      // Проверяем, что данные содержат как минимум стандартные статусы
      const hasDefaultStatuses = ['Backlog', 'InProgress', 'Done'].every(
        key => serverStatuses.some(status => status.key === key)
      );
      
      if (hasDefaultStatuses) {
        setAllStatuses(serverStatuses);
      } else {
        // Если в данных с сервера отсутствуют стандартные статусы, добавляем их
        const defaultStatuses = [
          { key: 'Backlog', label: STATUS_LABELS.Backlog },
          { key: 'InProgress', label: STATUS_LABELS.InProgress },
          { key: 'Done', label: STATUS_LABELS.Done },
        ];
        
        // Фильтруем дубликаты, если они есть
        const uniqueServerStatuses = serverStatuses.filter(
          serverStatus => !defaultStatuses.some(def => def.key === serverStatus.key)
        );
        
        setAllStatuses([...defaultStatuses, ...uniqueServerStatuses]);
      }
    } else if (error) {
      console.error('Ошибка при получении статусов:', error);
    }
  }, [serverStatuses, error]);

  // Функция для создания нового статуса
  const createStatus = useCallback((key: string, label: string) => {
    // Проверяем, что ключ уникален
    if (allStatuses.some(status => status.key === key)) {
      throw new Error(`Статус с ключом "${key}" уже существует`);
    }
    
    // Добавляем новый статус
    addCustomStatus({ key, label });
  }, [allStatuses, addCustomStatus]);

  // Функция для получения метки статуса по ключу
  const getStatusLabel = useCallback((statusKey: string): string => {
    const status = allStatuses.find(s => s.key === statusKey);
    return status ? status.label : statusKey;
  }, [allStatuses]);

  // Функция для проверки существования статуса
  const statusExists = useCallback((statusKey: string): boolean => {
    return allStatuses.some(status => status.key === statusKey);
  }, [allStatuses]);
  
  // Функция для получения цвета статуса
  const getStatusColor = useCallback((statusKey: string): 'info' | 'warning' | 'success' | 'default' => {
    switch (statusKey) {
      case 'Backlog': return 'info';
      case 'InProgress': return 'warning';
      case 'Done': return 'success';
      default: return 'default';
    }
  }, []);

  return {
    statuses: allStatuses,
    isLoading,
    isCreating,
    createStatus,
    getStatusLabel,
    statusExists,
    getStatusColor,
    error
  };
}

export default useTaskStatuses;