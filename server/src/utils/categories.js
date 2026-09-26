// Категории доходов
export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Зарплата' },
  { id: 'freelance', label: 'Подработка' },
  { id: 'bonus', label: 'Премия' },
  { id: 'debt_return', label: 'Возврат долга' },
  { id: 'deposit_interest', label: 'Проценты по вкладу' },
  { id: 'gift', label: 'Подарок' },
  { id: 'other', label: 'Прочее' },
];

// Категории расходов
export const EXPENSE_CATEGORIES = [
  { id: 'groceries', label: 'Продукты' },
  { id: 'utilities', label: 'Коммуналка' },
  { id: 'rent', label: 'Аренда' },
  { id: 'subscriptions', label: 'Подписки' },
  { id: 'transport', label: 'Транспорт' },
  { id: 'health', label: 'Здоровье' },
  { id: 'clothing', label: 'Одежда' },
  { id: 'entertainment', label: 'Развлечения' },
  { id: 'communication', label: 'Связь' },
  { id: 'other', label: 'Прочее' },
];

// Вспомогательные функции для работы с категориями
export const getIncomeCategoryById = (id) => {
  return INCOME_CATEGORIES.find(cat => cat.id === id);
};

export const getExpenseCategoryById = (id) => {
  return EXPENSE_CATEGORIES.find(cat => cat.id === id);
};

export const getAllIncomeCategoryIds = () => {
  return INCOME_CATEGORIES.map(cat => cat.id);
};

export const getAllExpenseCategoryIds = () => {
  return EXPENSE_CATEGORIES.map(cat => cat.id);
};