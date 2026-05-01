import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Key, Globe, History, Activity, 
  Settings, LogOut, Menu, X, Bell, User, ChevronRight,
  ShieldCheck, Users, CreditCard
} from 'lucide-react';

const DashboardLayout = ({ children, type = 'client', userEmail = '' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const clientLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Clés API', path: '/dashboard/keys', icon: <Key size={20} /> },
    { name: 'Pays & Services', path: '/dashboard/countries', icon: <Globe size={20} /> },
    { name: 'Transactions', path: '/dashboard/transactions', icon: <History size={20} /> },
    { name: 'Logs API', path: '/dashboard/logs', icon: <Activity size={20} /> },
    { name: 'Webhooks', path: '/dashboard/webhooks', icon: <Settings size={20} /> },
  ];

  const adminLinks = [
    { name: 'Aperçu', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Développeurs', path: '/admin/dashboard?tab=devs', icon: <Users size={20} /> },
    { name: 'Approbations', path: '/admin/dashboard?tab=approvals', icon: <ShieldCheck size={20} /> },
    { name: 'Transactions Globales', path: '/admin/dashboard?tab=all-tx', icon: <CreditCard size={20} /> },
  ];

  const links = type === 'admin' ? adminLinks : clientLinks;

  const handleLogout = () => {
    if (type === 'admin') {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
    } else {
      localStorage.removeItem('devToken');
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-secondary-950 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } hidden md:flex bg-white dark:bg-secondary-900 border-r border-slate-200 dark:border-secondary-800 transition-all duration-300 flex flex-col z-50`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-secondary-800 shrink-0">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/20">
              <Key className="w-4 h-4 text-white" />
            </div>
            {isSidebarOpen && (
              <div className="whitespace-nowrap">
                <span className="font-black text-slate-900 dark:text-white">AfriKPay</span>
                <span className="block text-[8px] font-bold text-primary-500 uppercase tracking-widest -mt-1">
                  {type === 'admin' ? 'Admin Central' : 'Developers'}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {links.map((link) => {
            const isActive = location.pathname + location.search === link.path || (location.pathname === link.path && !location.search && link.name === 'Dashboard');
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-secondary-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className={`${isActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                  {link.icon}
                </div>
                {isSidebarOpen && <span className="text-sm font-bold truncate">{link.name}</span>}
                {isActive && isSidebarOpen && <div className="ml-auto w-1 h-4 bg-primary-500 rounded-full" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-secondary-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-all group"
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            {isSidebarOpen && <span className="text-sm font-bold">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-white dark:bg-secondary-900 border-b border-slate-200 dark:border-secondary-800 flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-secondary-800 text-slate-500 transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-lg font-black text-slate-800 dark:text-white hidden sm:block">
              {type === 'admin' ? 'Console Administration' : 'Espace Développeur'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-secondary-800 text-slate-400 relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-secondary-900"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 dark:border-secondary-800 mx-1"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-black text-slate-900 dark:text-white leading-none mb-1">{userEmail.split('@')[0]}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">{type === 'admin' ? 'Root Admin' : 'Developer'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-secondary-800 flex items-center justify-center border border-slate-200 dark:border-secondary-700 shadow-sm overflow-hidden">
                <User size={20} className="text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-secondary-900 border-t border-slate-200 dark:border-secondary-800 px-2 py-3 flex items-center justify-around z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          {links.slice(0, 5).map((link) => {
            const isActive = location.pathname + location.search === link.path || (location.pathname === link.path && !location.search && link.name === 'Dashboard');
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex flex-col items-center gap-1 transition-all ${
                  isActive ? 'text-primary-500' : 'text-slate-400'
                }`}
              >
                <div className={`${isActive ? 'scale-110' : ''} transition-transform`}>
                  {link.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default DashboardLayout;
