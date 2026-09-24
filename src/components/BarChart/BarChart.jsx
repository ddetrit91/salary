import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './BarChart.module.css';

function BarChart({ data = [], title = 'Статистика' }) {
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
                {entry.value.toLocaleString('ru-RU')} ₽
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
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fill: '#6c757d' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6c757d' }}
            tickFormatter={(value) => `${value}₽`}
          />
          <Tooltip content={renderTooltip} />
          <Legend content={renderLegend} />
          <Bar 
            dataKey="income" 
            name="Доходы" 
            fill="#2ecc71" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="expense" 
            name="Расходы" 
            fill="#e74c3c" 
            radius={[4, 4, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChart;