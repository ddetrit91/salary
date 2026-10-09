// Применяет миграцию: добавляет колонку last_ip в таблицу users.
// Использует существующее подключение к БД из server/src/db/connection.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Динамический импорт ESM-модуля
(async () => {
  try {
    const dbModule = await import('../src/db/connection.js');
    const db = dbModule.default;

    console.log('Проверяю таблицу users...');
    const cols = await db.all(`PRAGMA table_info(users)`);
    const hasLastIp = cols.some((c) => c.name === 'last_ip');

    if (hasLastIp) {
      console.log('✅ Колонка last_ip уже существует — миграция не нужна.');
      process.exit(0);
    }

    console.log('Применяю миграцию: ALTER TABLE users ADD COLUMN last_ip TEXT;');
    await db.run(`ALTER TABLE users ADD COLUMN last_ip TEXT`);
    console.log('✅ Миграция успешно применена!');

    // Проверяем результат
    const colsAfter = await db.all(`PRAGMA table_info(users)`);
    console.log('Текущие колонки:', colsAfter.map((c) => c.name).join(', '));

    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    process.exit(1);
  }
})();