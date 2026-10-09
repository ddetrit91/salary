import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './PieChart.module.css';

// Цвета для секторов диаграммы (используются, если в данных нет своих)
const COLORS = [
  '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0',
  '#4895ef', '#560bad', '#b5179e', '#f77f00', '#06ffa5'
];

function PieChart({ data = [] }) {
  // Если данных нет — показываем заглушку
  if (!data || data.length === 0) {
    return (
      <div className={styles.placeholder}>
        <div className={styles.placeholderIcon}>🥧</div>
        <p className={styles.placeholderText}>Нет данных для отображения</p>
        <p className={styles.placeholderHint}>Добавьте операции, чтобы увидеть график</p>
      </div>
    );
  }

  // Считаем общую сумму для процентов
  const total = data.reduce((sum, entry) => sum + (entry.value || 0), 0);

  // Форматирование значения в tooltip
  const renderTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = ((item.value / total) * 100).toFixed(1);
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{item.name}</p>
          <p className={styles.tooltipValue}>{item.value.toLocaleString('ru-RU')} сум</p>
          <p className={styles.tooltipPercent}>{percentage}% от общей суммы</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chart}>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={renderTooltip} />
        </RechartsPieChart>
      </ResponsiveContainer>

      {/* Кастомная легенда под графиком с суммами и процентами */}
      <ul className={styles.legend}>
        {data.map((entry, index) => {
          const color = entry.color || COLORS[index % COLORS.length];
          const percentage = ((entry.value / total) * 100).toFixed(1);
          return (
            <li key={`legend-${index}`} className={styles.legendItem}>
              <span 
                className={styles.legendDot} 
                style={{ backgroundColor: color }}
              />
              <span className={styles.legendText}>{entry.name}</span>
              <span className={styles.legendAmount}>
                {entry.value.toLocaleString('ru-RU')} сум
              </span>
              <span className={styles.legendPercent}>({percentage}%)</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PieChart;