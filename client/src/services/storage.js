/**
 * Безопасно получает данные из localStorage
 * @param {string} key - ключ хранилища
 * @param {*} defaultValue - значение по умолчанию, если ключ не найден или ошибка парсинга
 * @returns {*} распарсенные данные или defaultValue
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Ошибка чтения из localStorage (ключ: ${key}):`, error);
    return defaultValue;
  }
};

/**
 * Безопасно сохраняет данные в localStorage
 * @param {string} key - ключ хранилища
 * @param {*} value - данные для сохранения
 * @returns {boolean} true, если сохранение успешно
 */
export const setItem = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Ошибка записи в localStorage (ключ: ${key}):`, error);
    return false;
  }
};

/**
 * Удаляет данные из localStorage
 * @param {string} key - ключ хранилища
 * @returns {boolean} true, если удаление успешно
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Ошибка удаления из localStorage (ключ: ${key}):`, error);
    return false;
  }
};

/**
 * Генерирует уникальный идентификатор
 * Использует crypto.randomUUID() если доступен, иначе fallback
 * @returns {string} уникальный ID
 */
export const generateId = () => {
  // crypto.randomUUID() поддерживается в современных браузерах
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback: генерация на основе timestamp и случайных чисел
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Очищает всё хранилище (используется для отладки)
 * @returns {boolean} true, если очистка успешна
 */
export const clearAll = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Ошибка очистки localStorage:', error);
    return false;
  }
};