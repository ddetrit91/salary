// Централизованный обработчик ошибок Express
// Формат ответа: { error: { code: string, message: string } }

export const errorHandler = (err, req, res, next) => {
  // Логируем ошибку в консоль для отладки
  console.error('❌ Ошибка:', err);

  // Определяем статус-код и сообщение
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || 'INTERNAL_ERROR';
  let message = err.message || 'Внутренняя ошибка сервера';

  // Обработка специфичных типов ошибок
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = err.message;
  }

  // Формируем ответ в едином формате
  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: message,
    },
  });
};

// Кастомные классы ошибок для удобного выбрасывания в сервисах/контроллерах
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.errorCode = 'VALIDATION_ERROR';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Ресурс не найден') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.errorCode = 'NOT_FOUND';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Неавторизованный доступ') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
    this.errorCode = 'UNAUTHORIZED';
  }
}