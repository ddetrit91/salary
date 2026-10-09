import { useState, useEffect } from 'react';
import styles from './Analytics.module.css';
import PieChart from '../../components/PieChart/PieChart';
import BarChart from '../../components/BarChart/BarChart';
import LineChart from '../../components/LineChart/LineChart';
import { getByCategory, getMonthlySummary } from '../../services/summaryService';

function Analytics() {
  // Состояния для данных графиков
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  
  // Состояния UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadData();
  }, []);

  // Функция загрузки данных для графиков (асинхронная)
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Запрашиваем данные параллельно для скорости
      const [categoryStats, monthlyStats] = await Promise.all([
        getByCategory('expense'),
        getMonthlySummary()
      ]);
      
      setCategoryData(categoryStats);
      setMonthlyData(monthlyStats);
    } catch (err) {
      console.error('Ошибка загрузки аналитики:', err);
      setError('Не удалось загрузить данные для графиков. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  // Индикатор загрузки
  if (loading) {
    return (
      <div className={styles.analytics}>
        <h1 className={styles.title}>Аналитика</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Загрузка графиков...</p>
        </div>
      </div>
    );
  }

  // Сообщение об ошибке
  if (error) {
    return (
      <div className={styles.analytics}>
        <h1 className={styles.title}>Аналитика</h1>
        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          <p>{error}</p>
          <button onClick={loadData} style={{ marginTop: '16px' }}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.analytics}>
      <h1 className={styles.title}>Аналитика</h1>

      {/* Сетка для графиков */}
      <div className={styles.chartsGrid}>
        {/* Круговая диаграмма расходов по категориям */}
        <div className={styles.chartContainer}>
          <h2 className={styles.chartTitle}>Расходы по категориям</h2>
          <PieChart data={categoryData} title="Расходы по категориям" />
        </div>

        {/* Столбчатый график доходов и расходов по месяцам */}
        <div className={styles.chartContainer}>
          <h2 className={styles.chartTitle}>Доходы и расходы по месяцам</h2>
          <BarChart data={monthlyData} title="Доходы и расходы по месяцам" />
        </div>

        {/* Линейный график накопленного баланса — на всю ширину */}
        <div className={styles.chartContainer} style={{ gridColumn: '1 / -1' }}>
          <h2 className={styles.chartTitle}>Баланс по месяцам</h2>
          <LineChart data={monthlyData} title="Баланс по месяцам" />
        </div>
      </div>
    </div>
  );
}

export default Analytics;