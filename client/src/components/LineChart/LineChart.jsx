import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
// Переиспользуем готовые адаптивные стили графиков
import styles from '../BarChart/BarChart.module.css';
import { useTheme } from '../../context/ThemeContext';

function LineChart({ data = [] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Цвета под текущую тему
  const axisColor = isDark ? '#94a3b8' : '#6c757d';
  const gridColor = isDark ? '#334155' : '#e9ecef';
  const lineColor = isDark ? '#60a5fa' : '#4361ee';

  // Если данных нет — показываем заглушку
  if (!data || data.length === 0) {
    return (
      <div className={styles.placeholder}>
        <div className={styles.placeholderIcon}>📈</div>
        <p className={styles.placeholderText}>Нет данных для отображения</p>
        <p className={styles.placeholderHint}>Добавьте операции, чтобы увидеть график</p>
      </div>
    );
  }

  // Накопительный баланс: сортируем по месяцам и суммируем нарастающим итогом
  let running = 0;
  const chartData = [...data]
    .sort((a, b) => (a.month < b.month ? -1 : 1))
    .map((row) => {
      running += (row.income || 0) - (row.expense || 0);
      return { month: row.month, balance: running };
    });

  // Компактный формат чисел для оси Y
  const formatAxis = (value) => {
    const abs = Math.abs(value);
    const sign = value < 0 ? '−' : '';
    if (abs >= 1000000) return `${sign}${(abs / 1000000).toLocaleString('ru-RU')} млн`;
    if (abs >= 1000) return `${sign}${(abs / 1000).toLocaleString('ru-RU')} тыс`;
    return `${sign}${abs}`;
  };

  // Подсказка при наведении на точку
  const renderTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipMonth}>{label}</p>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipDot} style={{ backgroundColor: lineColor }} />
            <span className={styles.tooltipLabel}>Баланс:</span>
            <span className={styles.tooltipValue} style={{ color: lineColor }}>
              {value.toLocaleString('ru-RU')} сум
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chart}>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={chartData}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: axisColor }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: axisColor }}
            tickFormatter={formatAxis}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
          />
          <Tooltip content={renderTooltip} />
          <Line
            type="monotone"
            dataKey="balance"
            name="Баланс"
            stroke={lineColor}
            strokeWidth={3}
            dot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChart;