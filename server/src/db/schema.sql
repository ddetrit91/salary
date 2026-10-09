-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT DEFAULT 'user',
  last_activity TEXT,
  last_ip       TEXT,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Таблица доходов
CREATE TABLE IF NOT EXISTS incomes (
  id          TEXT PRIMARY KEY,
  amount      REAL NOT NULL CHECK(amount > 0),
  date        TEXT NOT NULL,
  category    TEXT NOT NULL,
  comment     TEXT DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  user_id     TEXT
);

-- Таблица расходов
CREATE TABLE IF NOT EXISTS expenses (
  id            TEXT PRIMARY KEY,
  amount        REAL NOT NULL CHECK(amount > 0),
  date          TEXT NOT NULL,
  category      TEXT NOT NULL,
  comment       TEXT DEFAULT '',
  is_recurring  INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  user_id       TEXT
);

-- Индексы для ускорения фильтрации и сортировки
CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(date);
CREATE INDEX IF NOT EXISTS idx_incomes_category ON incomes(category);
CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);

-- Журнал активности
CREATE TABLE IF NOT EXISTS activity_logs (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  method     TEXT NOT NULL,
  path       TEXT NOT NULL,
  ip         TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Системные настройки (ключ-значение)
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);