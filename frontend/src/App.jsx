import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import ScrollToTop from './components/ScrollToTop';
import DevelopersLanding from './pages/developers/DevelopersLanding';
import DeveloperLogin from './pages/developers/DeveloperLogin';
import DeveloperRegister from './pages/developers/DeveloperRegister';
import DeveloperPricing from './pages/developers/DeveloperPricing';
import { DashboardProvider } from './pages/developers/dashboard/DashboardContext';
import DashboardLayout from './components/DashboardLayout';
import Overview from './pages/developers/dashboard/Overview';
import Keys from './pages/developers/dashboard/Keys';
import Countries from './pages/developers/dashboard/Countries';
import Transactions from './pages/developers/dashboard/Transactions';
import Logs from './pages/developers/dashboard/Logs';
import Webhooks from './pages/developers/dashboard/Webhooks';
import DeveloperDocs from './pages/developers/DeveloperDocs';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<MainLayout><DevelopersLanding /></MainLayout>} />
      <Route path="/login" element={<MainLayout><DeveloperLogin /></MainLayout>} />
      <Route path="/register" element={<MainLayout><DeveloperRegister /></MainLayout>} />
      <Route path="/pricing" element={<MainLayout><DeveloperPricing /></MainLayout>} />
      <Route path="/docs" element={<MainLayout><DeveloperDocs /></MainLayout>} />
      
      {/* Dashboard pages with Shared Provider and Layout */}
      <Route path="/dashboard" element={
        <DashboardProvider>
          <DashboardLayout type="client">
            <Overview />
          </DashboardLayout>
        </DashboardProvider>
      } />
      <Route path="/dashboard/keys" element={
        <DashboardProvider>
          <DashboardLayout type="client">
            <Keys />
          </DashboardLayout>
        </DashboardProvider>
      } />
      <Route path="/dashboard/countries" element={
        <DashboardProvider>
          <DashboardLayout type="client">
            <Countries />
          </DashboardLayout>
        </DashboardProvider>
      } />
      <Route path="/dashboard/transactions" element={
        <DashboardProvider>
          <DashboardLayout type="client">
            <Transactions />
          </DashboardLayout>
        </DashboardProvider>
      } />
      <Route path="/dashboard/logs" element={
        <DashboardProvider>
          <DashboardLayout type="client">
            <Logs />
          </DashboardLayout>
        </DashboardProvider>
      } />
      <Route path="/dashboard/webhooks" element={
        <DashboardProvider>
          <DashboardLayout type="client">
            <Webhooks />
          </DashboardLayout>
        </DashboardProvider>
      } />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
    </>
  );
}

export default App;
