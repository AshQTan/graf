import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import LandingPage from './pages/LandingPage';
import PlaygroundPage from './pages/PlaygroundPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import GraphPage from './pages/GraphPage';
import HowToPage from './pages/HowToPage';
import SetupPage from './pages/SetupPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/play" element={<PlaygroundPage />} />
        <Route path="/howto" element={<HowToPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/graph/new" element={<SetupPage />} />
        <Route path="/graph/:id" element={<GraphPage />} />
      </Route>
    </Routes>
  );
}
