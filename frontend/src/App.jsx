import { Routes, Route } from 'react-router-dom';
import DevelopersLanding from './pages/developers/DevelopersLanding';
import DeveloperLogin from './pages/developers/DeveloperLogin';
import DeveloperRegister from './pages/developers/DeveloperRegister';
import DeveloperDashboard from './pages/developers/DeveloperDashboard';
import DeveloperDocs from './pages/developers/DeveloperDocs';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DevelopersLanding />} />
      <Route path="/login" element={<DeveloperLogin />} />
      <Route path="/register" element={<DeveloperRegister />} />
      <Route path="/dashboard" element={<DeveloperDashboard />} />
      <Route path="/docs" element={<DeveloperDocs />} />
    </Routes>
  );
}

export default App;
