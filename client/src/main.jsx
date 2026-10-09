import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './components/Toast/ToastContext.jsx';
import './theme.css';

// Находим корневой элемент в index.html и рендерим в него приложение
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
);