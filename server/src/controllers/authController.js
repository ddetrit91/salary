import * as userService from '../services/userService.js';

/**
 * Регистрация нового пользователя
 * POST /api/v1/auth/register
 * Body: { username, password }
 */
export const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      const error = new Error('Имя пользователя и пароль обязательны');
      error.statusCode = 400;
      error.errorCode = 'VALIDATION_ERROR';
      throw error;
    }

    const user = await userService.register(username, password);

    res.status(201).json({
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Авторизация пользователя
 * POST /api/v1/auth/login
 * Body: { username, password }
 */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      const error = new Error('Имя пользователя и пароль обязательны');
      error.statusCode = 400;
      error.errorCode = 'VALIDATION_ERROR';
      throw error;
    }

    const result = await userService.login(username, password);

    res.json({
      data: result, // Возвращаем { token, user }
    });
  } catch (error) {
    // Если ошибка от сервиса (неверный пароль), возвращаем 401
    if (error.message === 'Неверное имя пользователя или пароль') {
      error.statusCode = 401;
      error.errorCode = 'AUTH_ERROR';
    }
    next(error);
  }
};