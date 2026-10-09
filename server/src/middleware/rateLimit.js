// Легковесный in-memory rate-limiter для защиты от подбора паролей (Brute-Force)
const rateLimitMap = new Map();

/**
 * Middleware ограничения частоты запросов для авторизации и регистрации
 * Лимит: максимум 15 запросов в минуту с одного IP
 */
export const authRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 минута
  const maxRequests = 15;

  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  // Если окно истекло, сбрасываем счётчик
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }

  rateLimitMap.set(ip, record);

  // Периодическая очистка устаревших записей
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (record.count > maxRequests) {
    const error = new Error('Слишком много попыток. Пожалуйста, повторите через минуту.');
    error.statusCode = 429;
    error.errorCode = 'TOO_MANY_REQUESTS';
    return next(error);
  }

  next();
};

export default authRateLimiter;
