import { api } from './api.js';

// Ключи для хранения в localStorage
const TOKEN_KEY = 'salary_tracker_token';
const USER_KEY = 'salary_tracker_user';

/**
 * Регистрация нового пользователя
 * @param {string} username - имя пользователя
 * @param {string} password - пароль
 * @returns {Object} данные пользователя
 */
export const register = async (username, password) => {
  const response = await api.post('/auth/register', { username, password });
  return response.data;
};

/**
 * Авторизация пользователя
 * @param {string} username - имя пользователя
 * @param {string} password - пароль
 * @returns {Object} данные пользователя
 */
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  const { token, user } = response.data;
  
  // Сохраняем токен и данные пользователя в localStorage
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  return user;
};

/**
 * Выход из системы (очистка localStorage)
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Получение данных текущего пользователя из localStorage
 * @returns {Object|null} объект пользователя или null, если не авторизован
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Получение JWT токена из localStorage
 * @returns {string|null} токен или null
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};