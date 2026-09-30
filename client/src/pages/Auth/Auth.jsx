import { useState } from 'react';
import styles from './Auth.module.css';
import { login, register } from '../../services/authService';

function Auth({ onAuthSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLoginMode) {
        // Режим входа
        await login(username, password);
      } else {
        // Режим регистрации
        await register(username, password);
        // После успешной регистрации автоматически входим
        await login(username, password);
      }
      
      // Вызываем callback для обновления состояния приложения
      onAuthSuccess();
    } catch (err) {
      console.error('Ошибка авторизации:', err);
      setError(err.message || 'Произошла ошибка. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  // Переключение между входом и регистрацией
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError(null);
    setUsername('');
    setPassword('');
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>💰 Salary Tracker</h1>
          <p className={styles.subtitle}>
            {isLoginMode ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Имя пользователя
            </label>
            <input
              id="username"
              type="text"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите имя пользователя"
              required
              minLength={3}
              maxLength={20}
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Пароль
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading
              ? 'Загрузка...'
              : isLoginMode
              ? 'Войти'
              : 'Зарегистрироваться'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.switchText}>
            {isLoginMode ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
            <button
              type="button"
              className={styles.switchButton}
              onClick={toggleMode}
              disabled={loading}
            >
              {isLoginMode ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;