import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // локальное хранилище
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { formDraftsReducer } from './slices/formDraftsSlice';

// Определение конфигурации персистентности
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['formDrafts'], // сохраняем только слайс черновиков форм
};

// Объединение редьюсеров
const rootReducer = combineReducers({
  formDrafts: formDraftsReducer,
  // Добавьте другие редьюсеры по мере необходимости
});

// Создание персистентного редьюсера
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Создание хранилища
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Игнорирование действий персистентности
      },
    }),
});

// Создание персистора
export const persistor = persistStore(store);

// Экспорт типов
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;