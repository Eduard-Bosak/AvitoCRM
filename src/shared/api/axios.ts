import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Создаем экземпляр Axios с базовым URL из переменных окружения
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Создаем экземпляр HTTP клиента
export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик запросов для токенов аутентификации при необходимости
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем перехватчик ответов для обработки общих ошибок
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Обработка общих ошибок (401, 403, 500 и т.д.)
    if (error.response) {
      if (error.response.status === 401) {
        // Обработка истекшей аутентификации
        console.error('Ошибка аутентификации', error.response.data);
        // Можно добавить перенаправление на страницу входа
      } else if (error.response.status === 403) {
        console.error('Доступ запрещен', error.response.data);
      } else if (error.response.status === 500) {
        console.error('Ошибка сервера', error.response.data);
      }
    } else if (error.request) {
      console.error('Ошибка сети:', error.message);
    } else {
      console.error('Неизвестная ошибка:', error.message);
    }
    return Promise.reject(error);
  }
);
