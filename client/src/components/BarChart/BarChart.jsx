import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './BarChart.module.css';
import { useTheme } from '../../context/ThemeContext';

function BarChart({ data = [] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Цвета, адаптированные под текущую тему
  const axisColor = isDark ? '#94a3b8' : '#6c757d';
  const gridColor = isDark ? '#334155' : '#e9ecef';
  const incomeColor = isDark ? '#4ade80' : '#2ecc71';
  const expenseColor = isDark ? '#f87171' : '#e74c3c';

  // Если данных нет — показываем заглушку
  if (!data || data.length === 0) {
    return (
      <div className={styles.placeholder}>
        <div className={styles.placeholderIcon}>📊</div>
        <p className={styles.placeholderText}>Нет данных для отображения</p>
        <p className={styles.placeholderHint}>Добавьте операции, чтобы увидеть график</p>
      </div>
    );
  }

  // Компактный формат чисел для оси Y: 3 млн, 500 тыс
  const formatAxis = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toLocaleString('ru-RU')} млн`;
    if (value >= 1000) return `${(value / 1000).toLocaleString('ru-RU')} тыс`;
    return `${value}`;
  };

  // Форматирование значения в tooltip
  const renderTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipMonth}>{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className={styles.tooltipRow}>
              <span className={styles.tooltipDot} style={{ backgroundColor: entry.color }} />
              <span className={styles.tooltipLabel}>{entry.name}:</span>
              <span className={styles.tooltipValue} style={{ color: entry.color }}>
                {entry.value.toLocaleString('ru-RU')} сум
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Форматирование легенды
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <ul className={styles.legend}>
        {payload.map((entry, index) => (
          <li key={`legend-${index}`} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: entry.color }}
            />
            <span className={styles.legendText}>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={styles.chart}>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={data}>
          <CartesianGrid
            stroke={gridColor}
            strokeDasharray="3 3"
            vertical={false}
          />
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
          <Tooltip content={renderTooltip} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }} />
          <Legend content={renderLegend} />
          <Bar
            dataKey="income"
            name="Доходы"
            fill={incomeColor}
            radius={[4, 4, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="expense"
            name="Расходы"
            fill={expenseColor}
            radius={[4, 4, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChart;