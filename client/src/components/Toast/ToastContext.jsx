import { createContext, useContext, useState, useCallback } from 'react';
import styles from './Toast.module.css';

const ToastContext = createContext(null);

let toastId = 0;

// Иконки для разных типов уведомлений
const icons = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
};

/**
 * Провайдер тостов: оборачивает всё приложение и рендерит стек уведомлений
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Удаляет тост с плавной анимацией исчезновения
  const removeToast = useCallback((id) => {
    // Сначала добавляем класс анимации
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, closing: true } : t)));
    // Через 250мс (длина анимации) удаляем из массива
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  // Универсальная функция показа тоста
  const showToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type, closing: false }]);

      // Автоудаление по таймеру
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
  );

  // Удобные методы для компонентов
  const value = {
    success: (message) => showToast(message, 'success'),
    error: (message) => showToast(message, 'error'),
    info: (message) => showToast(message, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Стек уведомлений поверх всего */}
      <div className={styles.container}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]} ${toast.closing ? styles.closing : ''}`}
            onClick={() => removeToast(toast.id)}
            title="Нажмите, чтобы закрыть"
          >
            <span className={styles.icon}>{icons[toast.type]}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Хук для показа уведомлений в компонентах
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast должен использоваться внутри ToastProvider');
  }
  return context;
}