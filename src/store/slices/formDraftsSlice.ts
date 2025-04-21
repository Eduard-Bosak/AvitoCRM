import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Определение типов для черновиков форм
interface FormDraft {
  id: string;
  formType: 'task' | 'issue' | 'board';
  data: Record<string, any>;
  lastUpdated: number;
}

interface FormDraftsState {
  drafts: Record<string, FormDraft>;
}

// Начальное состояние
const initialState: FormDraftsState = {
  drafts: {},
};

// Создание слайса
export const formDraftsSlice = createSlice({
  name: 'formDrafts',
  initialState,
  reducers: {
    // Сохранение черновика формы
    saveDraft: (state, action: PayloadAction<Omit<FormDraft, 'lastUpdated'>>) => {
      const { id, formType, data } = action.payload;
      state.drafts[id] = {
        id,
        formType,
        data,
        lastUpdated: Date.now(),
      };
    },
    
    // Обновление существующего черновика формы
    updateDraft: (state, action: PayloadAction<{ id: string; data: Record<string, any> }>) => {
      const { id, data } = action.payload;
      if (state.drafts[id]) {
        state.drafts[id] = {
          ...state.drafts[id],
          data: { ...state.drafts[id].data, ...data },
          lastUpdated: Date.now(),
        };
      }
    },
    
    // Удаление черновика формы
    removeDraft: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.drafts[id];
    },
    
    // Очистка всех черновиков
    clearAllDrafts: (state) => {
      state.drafts = {};
    },
    
    // Очистка черновиков определенного типа
    clearDraftsByType: (state, action: PayloadAction<'task' | 'issue' | 'board'>) => {
      const formType = action.payload;
      const newDrafts: Record<string, FormDraft> = {};
      
      Object.keys(state.drafts).forEach(key => {
        if (state.drafts[key].formType !== formType) {
          newDrafts[key] = state.drafts[key];
        }
      });
      
      state.drafts = newDrafts;
    },
  },
});

// Экспорт действий
export const { 
  saveDraft, 
  updateDraft, 
  removeDraft, 
  clearAllDrafts,
  clearDraftsByType 
} = formDraftsSlice.actions;

// Селекторы
export const selectFormDraft = (state: RootState, id: string) => state.formDrafts.drafts[id];
export const selectAllDrafts = (state: RootState) => state.formDrafts.drafts;
export const selectDraftsByType = (state: RootState, formType: 'task' | 'issue' | 'board') => {
  return Object.values(state.formDrafts.drafts).filter(draft => draft.formType === formType);
};

// Экспорт редьюсера
export const formDraftsReducer = formDraftsSlice.reducer;