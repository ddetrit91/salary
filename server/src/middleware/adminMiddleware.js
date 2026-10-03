/**
 * Middleware для защиты административных маршрутов.
 * 
 * ВАЖНО (безопасность):
 * - Роль берётся из req.user, который заполняет middleware `authenticate`
 *   ПОСЛЕ проверки пользователя в базе данных. То есть роль нельзя подделать
 *   через токен или тело запроса.
 * - Этот middleware должен стоять В ЦЕПОЧКЕ ПОСЛЕ authenticate:
 *   app.use('/api/v1/admin', authenticate, requireAdmin, adminRouter);
 * - Любой запрос без роли 'admin' отклоняется с кодом 403.
 */
export const requireAdmin = (req, res, next) => {
  try {
    // Если authenticate не отработал — это ошибка конфигурации сервера
    if (!req.user) {
      const error = new Error('Требуется авторизация');
      error.statusCode = 401;
      error.errorCode = 'AUTH_REQUIRED';
      throw error;
    }

    // Жёсткая проверка роли, прочитанной из базы данных
    if (req.user.role !== 'admin') {
      const error = new Error('Доступ запрещён: требуются права администратора');
      error.statusCode = 403;
      error.errorCode = 'FORBIDDEN';
      throw error;
    }

    // Роль подтверждена — пропускаем запрос к админ-контроллерам
    next();
  } catch (error) {
    next(error);
  }
};