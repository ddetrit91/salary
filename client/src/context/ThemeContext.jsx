import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

// Ключ для сохранения выбора темы в localStorage
const THEME_KEY = 'salary_tracker_theme';

/**
 * Определяет начальную тему:
 * 1) сохранённый выбор пользователя,
 * 2) иначе — системная тема браузера.
 */
const getInitialTheme = () => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Провайдер темы: оборачивает всё приложение
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Применяем тему к документу и запоминаем выбор
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Переключение светлая <-> тёмная
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Хук для использования темы в компонентах
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme должен использоваться внутри ThemeProvider');
  }
  return context;
}