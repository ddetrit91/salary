import { logout } from './authService.js';

// В режиме разработки (DEV) используем localhost:3001,
// а в production на Vercel запросы идут строго по относительному пути /api/v1
const BASE_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3001')
  : (import.meta.env.VITE_API_URL || '');
const API_BASE_URL = `${BASE_URL}/api/v1`;

/**
 * Универсальная функция для отправки запросов к API
 */
const apiRequest = async (path, options = {}) => {
  const url = `${API_BASE_URL}${path}`;
  
  // Получаем токен из localStorage
  const token = localStorage.getItem('salary_tracker_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Если пользователь авторизован, добавляем токен в заголовки
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });

    // Истечение сессии относится ТОЛЬКО к защищённым запросам.
    // Запросы входа и регистрации (/auth/...) не перезагружаем,
    // чтобы пользователь увидел понятное сообщение об ошибке.
    if (response.status === 401 && !path.startsWith('/auth')) {
      logout(); // Очищаем данные сессии
      window.location.reload(); // Показываем экран входа
      throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Ошибка HTTP: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    const result = await response.json();
    
    // Если бэкенд вернул { data: ..., pagination: ... }, возвращаем как есть
    return result.data !== undefined ? result : { data: result };
    
  } catch (error) {
    console.error(`API Request Error [${options.method || 'GET'} ${url}]:`, error);
    throw error;
  }
};

export const api = {
  get: (path, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const urlWithParams = queryString ? `${path}?${queryString}` : path;
    return apiRequest(urlWithParams, { method: 'GET' });
  },
  post: (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => apiRequest(path, { method: 'DELETE' }),
};