import { useState, useEffect, useCallback } from 'react';
import styles from './Admin.module.css';
import * as adminService from '../../services/adminService';
import { getCurrentUser } from '../../services/authService';
import { useToast } from '../../components/Toast/ToastContext';

function Admin() {
  const currentUser = getCurrentUser();
  const toast = useToast();

  // Активная вкладка
  const [activeTab, setActiveTab] = useState('users');

  // Данные вкладок
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [settings, setSettings] = useState(null);

  // Состояния загрузки и ошибок
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Форма создания пользователя
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');

  // Загрузка данных активной вкладки
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'users') {
        setUsers(await adminService.getUsers());
      }
      if (activeTab === 'stats') {
        setStats(await adminService.getSystemStats());
      }
      if (activeTab === 'activity') {
        setActivity(await adminService.getActivityStats());
      }
      if (activeTab === 'settings') {
        setSettings(await adminService.getSettings());
      }
    } catch (err) {
      console.error('Ошибка загрузки админ-данных:', err);
      setError(err.message || 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Форматирование даты и времени
  const formatDateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (isNaN(date)) return value;
    return date.toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // Создание пользователя
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await adminService.createUser(newUsername, newPassword, newRole);
      setNewUsername('');
      setNewPassword('');
      setNewRole('user');
      setUsers(await adminService.getUsers());
      toast.success('Пользователь создан');
    } catch (err) {
      toast.error(err.message || 'Не удалось создать пользователя');
    }
  };

  // Удаление пользователя (с подтверждением)
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Удалить пользователя «${user.username}» и ВСЕ его данные?`)) return;
    try {
      await adminService.deleteUser(user.id);
      setUsers(await adminService.getUsers());
      toast.success('Пользователь удалён');
    } catch (err) {
      toast.error(err.message || 'Не удалось удалить пользователя');
    }
  };

  // Смена роли пользователя
  const handleToggleRole = async (user) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await adminService.updateUserRole(user.id, nextRole);
      setUsers(await adminService.getUsers());
      toast.success(`Роль изменена на «${nextRole === 'admin' ? 'Админ' : 'Пользователь'}»`);
    } catch (err) {
      toast.error(err.message || 'Не удалось изменить роль');
    }
  };

  // Сброс пароля пользователя
  const handleResetPassword = async (user) => {
    const password = window.prompt(`Новый пароль для «${user.username}» (минимум 6 символов):`);
    if (!password) return;
    try {
      await adminService.resetUserPassword(user.id, password);
      toast.success('Пароль обновлён');
    } catch (err) {
      toast.error(err.message || 'Не удалось обновить пароль');
    }
  };

  // Переключение разрешения регистрации
  const handleToggleRegistration = async () => {
    try {
      const updated = await adminService.updateSettings(!settings.allowRegistration);
      setSettings(updated);
      toast.success(
        updated.allowRegistration ? 'Регистрация включена' : 'Регистрация отключена',
      );
    } catch (err) {
      toast.error(err.message || 'Не удалось изменить настройку');
    }
  };

  // Защита интерфейса (основная защита — на бэкенде!)
  if (currentUser?.role !== 'admin') {
    return (
      <div className={styles.admin}>
        <h1 className={styles.title}>Админ-панель</h1>
        <div className={styles.error}>Доступ запрещён: требуются права администратора.</div>
      </div>
    );
  }

  const tabs = [
    { id: 'users', label: 'Пользователи' },
    { id: 'activity', label: 'Активность' },
    { id: 'stats', label: 'Статистика' },
    { id: 'settings', label: 'Настройки' },
  ];

  // Максимумы для мини-графиков
  const maxReg = stats ? Math.max(1, ...stats.registrationsPerDay.map((r) => r.count)) : 1;
  const maxReq = stats ? Math.max(1, ...stats.requestsPerDay.map((r) => r.count)) : 1;

  return (
    <div className={styles.admin}>
      <h1 className={styles.title}>Админ-панель</h1>

      {/* Переключатель вкладок */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p style={{ textAlign: 'center', padding: '40px' }}>Загрузка данных...</p>}
      {error && <div className={styles.error}>{error}</div>}

      {/* ---------- Вкладка: Пользователи ---------- */}
      {!loading && activeTab === 'users' && (
        <div className={styles.section}>
          <form className={styles.form} onSubmit={handleCreateUser}>
            <h3 className={styles.sectionTitle}>Создать пользователя</h3>
            <div className={styles.formRow}>
              <input
                className={styles.input}
                placeholder="Имя пользователя"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                minLength={3}
              />
              <input
                className={styles.input}
                type="password"
                placeholder="Пароль"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <select className={styles.select} value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="user">Пользователь</option>
                <option value="admin">Администратор</option>
              </select>
              <button className={styles.button} type="submit">Создать</button>
            </div>
          </form>

          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div>Пользователь</div>
              <div>Роль</div>
              <div>Операций</div>
              <div>IP</div>
              <div>Регистрация</div>
              <div>Последняя активность</div>
              <div style={{ textAlign: 'right' }}>Действия</div>
            </div>
            {users.map((user) => (
              <div key={user.id} className={styles.tableRow}>
                <div className={styles.cellBold}>
                  {user.username}
                  {user.id === currentUser.id && ' (вы)'}
                </div>
                <div>
                  <span className={`${styles.badge} ${user.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}`}>
                    {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                  </span>
                </div>
                <div>{(user.incomesCount ?? 0) + (user.expensesCount ?? 0)}</div>
                <div 
                  className={styles.ipCell} 
                  title={user.lastIp ? 'Нажмите, чтобы скопировать' : 'IP ещё не зафиксирован'}
                  onClick={() => {
                    if (user.lastIp) {
                      navigator.clipboard?.writeText(user.lastIp);
                    }
                  }}
                  style={{ cursor: user.lastIp ? 'pointer' : 'default' }}
                >
                  {user.lastIp || '—'}
                </div>
                <div>{formatDateTime(user.createdAt)}</div>
                <div>{formatDateTime(user.lastActivity)}</div>
                <div className={styles.actions}>
                  <button className={styles.smallButton} onClick={() => handleToggleRole(user)}>
                    {user.role === 'admin' ? 'Разжаловать' : 'В админы'}
                  </button>
                  <button className={styles.smallButton} onClick={() => handleResetPassword(user)}>
                    Пароль
                  </button>
                  <button
                    className={`${styles.smallButton} ${styles.dangerButton}`}
                    onClick={() => handleDeleteUser(user)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Вкладка: Активность ---------- */}
      {!loading && activeTab === 'activity' && activity && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Активность пользователей</h3>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div>Пользователь</div>
              <div>Роль</div>
              <div style={{ textAlign: 'right' }}>Запросов</div>
              <div>Последняя активность</div>
            </div>
            {activity.perUser.map((row) => (
              <div key={row.id} className={styles.tableRow}>
                <div className={styles.cellBold}>{row.username}</div>
                <div>{row.role === 'admin' ? 'Админ' : 'Пользователь'}</div>
                <div style={{ textAlign: 'right' }}>{row.requests_count}</div>
                <div>{formatDateTime(row.last_activity)}</div>
              </div>
            ))}
          </div>

          <h3 className={styles.sectionTitle}>Последние события</h3>
          <div className={styles.eventList}>
            {activity.recentEvents.length === 0 && <p>Событий пока нет.</p>}
            {activity.recentEvents.map((event, index) => (
              <div key={index} className={styles.eventItem}>
                <span className={styles.eventTime}>{formatDateTime(event.created_at)}</span>
                <span className={styles.cellBold}>{event.username}</span>
                <span className={styles.eventMethod}>{event.method}</span>
                <span className={styles.eventPath}>{event.path}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Вкладка: Статистика ---------- */}
      {!loading && activeTab === 'stats' && stats && (
        <div className={styles.section}>
          <div className={styles.cardGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.usersTotal}</div>
              <div className={styles.statLabel}>Всего пользователей</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.adminsTotal}</div>
              <div className={styles.statLabel}>Администраторов</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.activeToday}</div>
              <div className={styles.statLabel}>Активны сегодня</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.requestsToday}</div>
              <div className={styles.statLabel}>Запросов сегодня</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.incomesCount}</div>
              <div className={styles.statLabel}>Доходов ({stats.incomesTotal.toLocaleString('ru-RU')} сум)</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.expensesCount}</div>
              <div className={styles.statLabel}>Расходов ({stats.expensesTotal.toLocaleString('ru-RU')} сум)</div>
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Регистрации по дням</h3>
          <div className={styles.barList}>
            {stats.registrationsPerDay.map((row) => (
              <div key={row.day} className={styles.barRow}>
                <span className={styles.barLabel}>{row.day}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${(row.count / maxReg) * 100}%` }} />
                </div>
                <span className={styles.barValue}>{row.count}</span>
              </div>
            ))}
          </div>

          <h3 className={styles.sectionTitle}>Запросы по дням</h3>
          <div className={styles.barList}>
            {stats.requestsPerDay.map((row) => (
              <div key={row.day} className={styles.barRow}>
                <span className={styles.barLabel}>{row.day}</span>
                <div className={styles.barTrack}>
                  <div className={`${styles.barFill} ${styles.barFillBlue}`} style={{ width: `${(row.count / maxReq) * 100}%` }} />
                </div>
                <span className={styles.barValue}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Вкладка: Настройки ---------- */}
      {!loading && activeTab === 'settings' && settings && (
        <div className={styles.section}>
          <div className={styles.settingsRow}>
            <div>
              <div className={styles.cellBold}>Разрешить регистрацию новых пользователей</div>
              <div className={styles.settingsHint}>
                При отключении новые пользователи не смогут зарегистрироваться самостоятельно.
              </div>
            </div>
            <button className={styles.button} onClick={handleToggleRegistration}>
              {settings.allowRegistration ? 'Включено' : 'Отключено'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;