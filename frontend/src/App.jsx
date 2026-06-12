import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import ScrollToTop from './components/ScrollToTop';
import MerchantsLanding from './pages/developers/DevelopersLanding';
import MerchantLogin from './pages/developers/DeveloperLogin';
import MerchantRegister from './pages/developers/DeveloperRegister';
import MerchantPricing from './pages/developers/DeveloperPricing';
import { DashboardProvider } from './pages/developers/dashboard/DashboardContext';
import DashboardLayout from './components/DashboardLayout';
import Overview from './pages/developers/dashboard/Overview';
import Keys from './pages/developers/dashboard/Keys';
import Countries from './pages/developers/dashboard/Countries';
import Transactions from './pages/developers/dashboard/Transactions';
import Logs from './pages/developers/dashboard/Logs';
import Webhooks from './pages/developers/dashboard/Webhooks';
import Billing from './pages/developers/dashboard/Billing';
import MerchantDocs from './pages/developers/DeveloperDocs';
import CheckoutPage from './pages/checkout/CheckoutPage';
import SuccessPage from './pages/checkout/SuccessPage';
import CancelPage from './pages/checkout/CancelPage';
import PlaceholderPage from './pages/PlaceholderPage';
import { PrivacyPolicy, TermsOfService, CookiesPolicy, SecurityPolicy } from './pages/LegalPages';

function App() {
 return (
 <>
 <ScrollToTop />
 <Routes>
 <Route path="/" element={<MainLayout><MerchantsLanding /></MainLayout>} />
 <Route path="/pay/:id" element={<CheckoutPage />} />
 <Route path="/success" element={<SuccessPage />} />
 <Route path="/cancel" element={<CancelPage />} />
 <Route path="/login" element={<MainLayout><MerchantLogin /></MainLayout>} />
 <Route path="/register" element={<MainLayout><MerchantRegister /></MainLayout>} />
 <Route path="/pricing" element={<MainLayout><MerchantPricing /></MainLayout>} />
 <Route path="/docs" element={<MainLayout><MerchantDocs /></MainLayout>} />
 
 {/* Placeholder Routes for Footer Links */}
 <Route path="/community" element={<MainLayout><PlaceholderPage title="Communauté" /></MainLayout>} />
 <Route path="/status" element={<MainLayout><PlaceholderPage title="Statut de l'API" /></MainLayout>} />
 <Route path="/open-source" element={<MainLayout><PlaceholderPage title="Open Source" /></MainLayout>} />
 <Route path="/blog" element={<MainLayout><PlaceholderPage title="Blog Tech" /></MainLayout>} />
 <Route path="/privacy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
 <Route path="/terms" element={<MainLayout><TermsOfService /></MainLayout>} />
 <Route path="/cookies" element={<MainLayout><CookiesPolicy /></MainLayout>} />
 <Route path="/security" element={<MainLayout><SecurityPolicy /></MainLayout>} />
 
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
 <Route path="/dashboard/billing" element={
 <DashboardProvider>
 <DashboardLayout type="client">
 <Billing />
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

 </Routes>
 </>
 );
}

export default App;
