import jwt from 'jsonwebtoken';
import config from '../config/index.js';

// Секретный ключ должен совпадать с тем, что в userService.js
const JWT_SECRET = config.jwtSecret || 'super-secret-dev-key-change-me-in-production';

/**
 * Middleware для проверки авторизации пользователя
 */
export const authenticate = (req, res, next) => {
  try {
    // Получаем токен из заголовка Authorization (формат: "Bearer <token>")
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Требуется авторизация');
      error.statusCode = 401;
      error.errorCode = 'AUTH_REQUIRED';
      throw error;
    }

    // Извлекаем сам токен (убираем префикс "Bearer ")
    const token = authHeader.split(' ')[1];
    
    // Проверяем и декодируем токен
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Сохраняем ID пользователя в объект запроса, чтобы сервисы могли его использовать
    req.userId = decoded.userId;
    
    // Передаём управление следующему middleware или контроллеру
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