import { useState, useEffect } from 'react';
import styles from './Analytics.module.css';
import PieChart from '../../components/PieChart/PieChart';
import BarChart from '../../components/BarChart/BarChart';
import { getByCategory, getMonthlySummary } from '../../services/summaryService';

function Analytics() {
  // Состояния для данных графиков
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadData();
  }, []);

  // Функция загрузки данных для графиков
  const loadData = () => {
    // Данные для круговой диаграммы (расходы по категориям)
    const categoryStats = getByCategory('expense');
    setCategoryData(categoryStats);

    // Данные для столбчатого графика (доходы и расходы по месяцам)
    const monthlyStats = getMonthlySummary();
    setMonthlyData(monthlyStats);
  };

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
      </div>
    </div>
  );
}

export default Analytics;