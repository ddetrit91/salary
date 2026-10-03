import { api } from './api.js';

// ---------- Пользователи ----------

/**
 * Список всех пользователей
 * @returns {Array} массив пользователей с ролями и активностью
 */
export const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

/**
 * Создание пользователя администратором
 * @param {string} username - имя пользователя
 * @param {string} password - пароль
 * @param {string} role - роль ('user' или 'admin')
 */
export const createUser = async (username, password, role = 'user') => {
  const response = await api.post('/admin/users', { username, password, role });
  return response.data;
};

/**
 * Удаление пользователя
 * @param {string} id - идентификатор пользователя
 */
export const deleteUser = async (id) => {
  return api.del(`/admin/users/${id}`);
};

/**
 * Смена роли пользователя
 * @param {string} id - идентификатор пользователя
 * @param {string} role - новая роль
 */
export const updateUserRole = async (id, role) => {
  const response = await api.put(`/admin/users/${id}/role`, { role });
  return response.data;
};

/**
 * Сброс пароля пользователя
 * @param {string} id - идентификатор пользователя
 * @param {string} password - новый пароль
 */
export const resetUserPassword = async (id, password) => {
  const response = await api.put(`/admin/users/${id}/password`, { password });
  return response.data;
};

// ---------- Статистика и активность ----------

/**
 * Общая системная статистика
 */
export const getSystemStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

/**
 * Активность пользователей и последние события
 */
export const getActivityStats = async () => {
  const response = await api.get('/admin/activity');
  return response.data;
};

// ---------- Настройки ----------

/**
 * Получить системные настройки
 */
export const getSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

/**
 * Обновить системные настройки
 * @param {boolean} allowRegistration - разрешить регистрацию
 */
export const updateSettings = async (allowRegistration) => {
  const response = await api.put('/admin/settings', { allowRegistration });
  return response.data;
};