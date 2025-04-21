import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { 
  saveDraft, 
  updateDraft, 
  removeDraft,
  selectFormDraft
} from '../../store/slices/formDraftsSlice';
import type { RootState } from '../../store';

/**
 * Пользовательский хук для управления черновиками форм с использованием Redux-персистентности
 * 
 * @param draftId - Опциональный ID черновика. Если не указан, будет сгенерирован новый UUID
 * @param formType - Тип формы ('task', 'issue' или 'board')
 * @returns Объект с методами для сохранения, получения, обновления и удаления черновиков
 */
export function useFormDraft(
  draftId: string = uuidv4(), 
  formType: 'task' | 'issue' | 'board'
) {
  const dispatch = useDispatch();
  const draftData = useSelector((state: RootState) => selectFormDraft(state, draftId));
  
  /**
   * Сохранить текущие данные формы в черновик
   */
  const saveFormDraft = useCallback((data: Record<string, any>) => {
    dispatch(saveDraft({ id: draftId, formType, data }));
  }, [dispatch, draftId, formType]);
  
  /**
   * Обновить существующий черновик формы новыми данными
   */
  const updateFormDraft = useCallback((data: Record<string, any>) => {
    dispatch(updateDraft({ id: draftId, data }));
  }, [dispatch, draftId]);
  
  /**
   * Удалить текущий черновик формы
   */
  const removeFormDraft = useCallback(() => {
    dispatch(removeDraft(draftId));
  }, [dispatch, draftId]);
  
  /**
   * Получить текущие данные черновика или null, если черновик не существует
   */
  const getDraftData = useCallback(() => {
    return draftData?.data || null;
  }, [draftData]);
  
  /**
   * Проверить, существует ли черновик
   */
  const hasDraft = Boolean(draftData);
  
  return {
    saveFormDraft,
    updateFormDraft,
    removeFormDraft,
    getDraftData,
    draftId,
    hasDraft,
    lastUpdated: draftData?.lastUpdated,
  };
}