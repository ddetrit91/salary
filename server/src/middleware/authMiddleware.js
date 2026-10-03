import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import db from '../db/connection.js';
import { touchLastActivity, logActivity } from '../services/userService.js';

// Секретный ключ должен совпадать с тем, что в userService.js
const JWT_SECRET = config.jwtSecret || 'super-secret-dev-key-change-me-in-production';

/**
 * Middleware для проверки авторизации пользователя.
 * ВАЖНО: существование пользователя и его роль проверяются ПО БАЗЕ ДАННЫХ,
 * а не только по токену. Это защищает от устаревших токенов
 * (после удаления пользователя или смены его роли).
 */
export const authenticate = async (req, res, next) => {
  try {
    // Получаем токен из заголовка Authorization (формат: "Bearer <token>")
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Требуется авторизация');
      error.statusCode = 401;
      error.errorCode = 'AUTH_REQUIRED';
      throw error;
    }

    // Извлекаем и декодируем токен
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Проверяем пользователя в базе: если он удалён — токен недействителен
    const user = await db.get('SELECT id, username, role FROM users WHERE id = ?', [decoded.userId]);
    if (!user) {
      const error = new Error('Пользователь не найден. Обратитесь к администратору.');
      error.statusCode = 401;
      error.errorCode = 'USER_NOT_FOUND';
      throw error;
    }

    // Сохраняем данные пользователя в объект запроса
    req.userId = user.id;
    req.user = { id: user.id, username: user.username, role: user.role || 'user' };

    // Обновляем время последней активности и пишем посещение в журнал (фоново)
    touchLastActivity(user.id);
    logActivity(user.id, req.method, req.originalUrl, req.ip);

    next();
  } catch (error) {
    // Обработка специфичных ошибок JWT
    if (error.name === 'JsonWebTokenError') {
      error.statusCode = 401;
      error.errorCode = 'INVALID_TOKEN';
      error.message = 'Недействительный токен';
    }
    if (error.name === 'TokenExpiredError') {
      error.statusCode = 401;
      error.errorCode = 'TOKEN_EXPIRED';
      error.message = 'Срок действия токена истек';
    }
    next(error);
  }
};

export default authenticate;