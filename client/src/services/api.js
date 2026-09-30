// Базовый URL берется из .env, с фоллбэком на localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE_URL = `${BASE_URL}/api/v1`;

/**
 * Универсальная функция для отправки запросов к API
 */
const apiRequest = async (path, options = {}) => {
  const url = `${API_BASE_URL}${path}`;
  
  // Получаем токен из localStorage (ключ совпадает с тем, что в authService.js)
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