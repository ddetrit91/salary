import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './PieChart.module.css';

// Цвета для секторов диаграммы
const COLORS = [
  '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0',
  '#4895ef', '#560bad', '#b5179e', '#f77f00', '#06ffa5'
];

function PieChart({ data = [], title = 'Распределение' }) {
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

  // Форматирование значения в tooltip
  const renderTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{data.name}</p>
          <p className={styles.tooltipValue}>{data.value.toLocaleString('ru-RU')} ₽</p>
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
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={renderTooltip} />
          <Legend content={renderLegend} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PieChart;