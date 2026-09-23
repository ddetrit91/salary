import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';

// Временные заглушки для остальных страниц
const HistoryStub = () => <div>История</div>;
const AnalyticsStub = () => <div>Аналитика</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/history" element={<Layout><HistoryStub /></Layout>} />
        <Route path="/analytics" element={<Layout><AnalyticsStub /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;