/**
 * Форматирует дату в читаемый вид
 * @param {string} dateString - строка даты (ISO формат или другой валидный)
 * @param {object} options - опции форматирования (day, month, year)
 * @returns {string} отформатированная дата
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Проверяем, что дата валидна
  if (isNaN(date.getTime())) return '';
  
  // По умолчанию показываем день, месяц и год
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options
  };
  
  return date.toLocaleDateString('ru-RU', defaultOptions);
};

/**
 * Форматирует дату с названием месяца (например, "15 января 2024")
 * @param {string} dateString - строка даты
 * @returns {string} отформатированная дата
 */
export const formatDateWithMonth = (dateString) => {
  return formatDate(dateString, { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

/**
 * Форматирует сумму в валюту с символом рубля
 * @param {number} amount - сумма
 * @param {boolean} showSign - показывать ли знак +/- (для доходов/расходов)
 * @param {string} type - тип операции ('income' или 'expense')
 * @returns {string} отформатированная сумма
 */
export const formatCurrency = (amount, showSign = false, type = '') => {
  if (amount === null || amount === undefined) return '0 сум';
  
  const formatted = amount.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  let sign = '';
  if (showSign) {
    if (type === 'income') {
      sign = '+';
    } else if (type === 'expense') {
      sign = '−';
    }
  }
  
  return `${sign}${formatted} сум`;
};

/**
 * Форматирует число с разделителями тысяч
 * @param {number} number - число
 * @returns {string} отформатированное число
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  return number.toLocaleString('ru-RU');
};

/**
 * Получает короткое название месяца (например, "Янв", "Фев")
 * @param {number} monthIndex - индекс месяца (0-11)
 * @returns {string} короткое название месяца
 */
export const getShortMonthName = (monthIndex) => {
  const months = [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
  ];
  return months[monthIndex] || '';
};

/**
 * Получает полное название месяца (например, "Январь", "Февраль")
 * @param {number} monthIndex - индекс месяца (0-11)
 * @returns {string} полное название месяца
 */
export const getFullMonthName = (monthIndex) => {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return months[monthIndex] || '';
};