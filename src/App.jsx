import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import styles from './App.module.css';

// Временные заглушки для страниц, которые мы создадим в следующих фазах
const DashboardStub = () => <main style={{ padding: '20px' }}>Главная</main>;
const HistoryStub = () => <main style={{ padding: '20px' }}>История</main>;
const AnalyticsStub = () => <main style={{ padding: '20px' }}>Аналитика</main>;

function App() {
  return (
    <BrowserRouter>
      <div className={styles.container}>
        <Header />
        <Routes>
          <Route path="/" element={<DashboardStub />} />
          <Route path="/history" element={<HistoryStub />} />
          <Route path="/analytics" element={<AnalyticsStub />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;