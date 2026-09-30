// Базовый URL нашего бэкенда
const API_BASE_URL = 'http://localhost:3001/api/v1';

/**
 * Универсальная функция для отправки запросов к API
 * @param {string} endpoint - путь эндпоинта (например, '/incomes')
 * @param {Object} options - опции для fetch (method, body, headers и т.д.)
 * @returns {Promise<any>} распарсенный JSON-ответ
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Формируем заголовки по умолчанию
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });

    // Если сервер вернул ошибку (4xx или 5xx), выбрасываем исключение
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Ошибка HTTP: ${response.status}`);
    }

    // Если статус 204 (No Content), возвращаем null
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request Error [${options.method || 'GET'} ${url}]:`, error);
    throw error;
  }
};

// Удобные обёртки для разных методов
export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};