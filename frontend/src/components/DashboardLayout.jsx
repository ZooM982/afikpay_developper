import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
 LayoutDashboard, Key, Globe, History, Activity, 
 Settings, LogOut, Menu, X, Bell, User, ChevronRight,
 ShieldCheck, Users, CreditCard, CheckCircle, ExternalLink, BookOpen, MoreHorizontal
} from 'lucide-react';
import { getApiUrl } from '../config';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useDashboard } from '../pages/developers/dashboard/DashboardContext';

const DashboardLayout = ({ children, type = 'client' }) => {
 const [isSidebarOpen, setIsSidebarOpen] = useState(true);
 const [notifications, setNotifications] = useState([]);
 const [isNotifOpen, setIsNotifOpen] = useState(false);
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const notifRef = useRef(null);
 
 const navigate = useNavigate();
 const location = useLocation();
 const { profile } = useDashboard();

 const token = localStorage.getItem('devToken');
 const apiPath = '/developer/notifications';
 const pushApiPath = `${getApiUrl()}/developer`;
 
 const { isSupported, isSubscribed, subscribeUser } = usePushNotifications(pushApiPath, token);

 useEffect(() => {
 const fetchNotifications = async () => {
 if (!token) return;
 try {
 const res = await fetch(`${getApiUrl()}${apiPath}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 const data = await res.json();
 if (res.ok) setNotifications(data.notifications || []);
 } catch (err) {
 console.error("Error fetching notifications", err);
 }
 };
 fetchNotifications();
 // Poll every 60 seconds
 const interval = setInterval(fetchNotifications, 60000);
 return () => clearInterval(interval);
 }, [token, apiPath]);

 useEffect(() => {
 const handleClickOutside = (e) => {
 if (notifRef.current && !notifRef.current.contains(e.target)) {
 setIsNotifOpen(false);
 }
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const handleMarkAsRead = async () => {
 if (!token) return;
 try {
 await fetch(`${getApiUrl()}${apiPath}/read`, {
 method: 'PUT',
 headers: { Authorization: `Bearer ${token}` }
 });
 setNotifications(notifications.map(n => ({ ...n, isRead: true })));
 } catch (err) {
 console.error("Error marking notifications as read", err);
 }
 };

 const toggleNotif = () => {
 setIsNotifOpen(!isNotifOpen);
 if (!isNotifOpen && unreadCount > 0) {
 handleMarkAsRead();
 }
 };

 const handleNotifClick = (url) => {
 setIsNotifOpen(false);
 if (url) navigate(url);
 };

 const unreadCount = notifications.filter(n => !n.isRead).length;

 const clientLinks = [
 { name: 'Dashboard', mobileName: 'Accueil', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
 { name: 'Clés API', mobileName: 'Clés', path: '/dashboard/keys', icon: <Key size={20} /> },
 { name: 'Pays & Services', mobileName: 'Pays', path: '/dashboard/countries', icon: <Globe size={20} /> },
 { name: 'Transactions', mobileName: 'Paiements', path: '/dashboard/transactions', icon: <CreditCard size={20} /> },
 { name: 'Facturation & Plans', mobileName: 'Forfaits', path: '/dashboard/billing', icon: <CreditCard size={20} /> },
 { name: 'Webhooks', mobileName: 'Webhooks', path: '/dashboard/webhooks', icon: <Settings size={20} /> },
 { name: 'Logs', mobileName: 'Logs', path: '/dashboard/logs', icon: <Activity size={20} /> },
 { name: 'Paramètres', mobileName: 'Paramètres', path: '/dashboard/settings', icon: <User size={20} /> },
 { name: 'Documentation', mobileName: 'Docs', path: '/docs', icon: <BookOpen size={20} /> },
 ];

 const links = clientLinks;

 const handleLogout = () => {
 localStorage.removeItem('devToken');
 navigate('/login');
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
 <div className="w-8 h-8 flex items-center justify-center shrink-0">
 <img src="/logo.png" alt="AfrikPay" className="w-full h-full object-contain" />
 </div>
 {isSidebarOpen && (
 <div className="whitespace-nowrap">
 <span className="font-black text-slate-900 dark:text-white">AfriKPay</span>
 <span className="block text-[8px] font-bold text-primary-500 uppercase tracking-widest -mt-1">
 Merchants
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
 className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group ${
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
 className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-all group"
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
 className="p-2 rounded hover:bg-slate-100 dark:hover:bg-secondary-800 text-slate-500 transition-colors"
 >
 {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
 </button>
 <h2 className="text-lg font-black text-slate-800 dark:text-white hidden sm:block">
 Espace Développeur
 </h2>
 </div>

 <div className="flex items-center gap-4">
 <div className="relative" ref={notifRef}>
 <button 
 onClick={toggleNotif}
 className="p-2 rounded hover:bg-slate-100 dark:hover:bg-secondary-800 text-slate-400 relative transition-colors focus:outline-none"
 >
 <Bell size={20} />
 {unreadCount > 0 && (
 <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-secondary-900 animate-pulse"></span>
 )}
 </button>

 {isNotifOpen && (
 <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-secondary-900 rounded-md border border-slate-100 dark:border-secondary-800 z-50 overflow-hidden flex flex-col">
 <div className="p-4 border-b border-slate-100 dark:border-secondary-800 flex items-center justify-between bg-slate-50 dark:bg-secondary-800/50">
 <h3 className="font-black text-slate-900 dark:text-white text-sm">Notifications</h3>
 {unreadCount > 0 && <span className="bg-primary-100 text-primary-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} non lues</span>}
 </div>
 
 <div className="overflow-y-auto max-h-96 custom-scrollbar">
 {notifications.length === 0 ? (
 <div className="p-6 text-center">
 <Bell className="w-8 h-8 text-slate-200 dark:text-secondary-800 mx-auto mb-2" />
 <p className="text-sm font-bold text-slate-400">Aucune notification</p>
 </div>
 ) : (
 <div className="divide-y divide-slate-50 dark:divide-secondary-800/50">
 {[...notifications].reverse().map(notif => (
 <div 
 key={notif.id} 
 onClick={() => handleNotifClick(notif.url)}
 className={`p-4 hover:bg-slate-50 dark:hover:bg-secondary-800 cursor-pointer transition-colors ${!notif.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
 >
 <div className="flex gap-3">
 <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!notif.isRead ? 'bg-primary-500' : 'bg-transparent'}`} />
 <div>
 <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{notif.title}</p>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notif.message}</p>
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 block">
 {new Date(notif.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 
 <div className="h-8 w-px bg-slate-200 dark:border-secondary-800 mx-1"></div>
 
 <div className="flex items-center gap-3">
 <div className="text-right hidden md:block">
 <p className="text-xs font-black text-slate-900 dark:text-white leading-none mb-1">{profile?.name || profile?.email?.split('@')[0] || 'Développeur'}</p>
 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Marchand</p>
 </div>
 <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-secondary-800 flex items-center justify-center border border-slate-200 dark:border-secondary-700 overflow-hidden">
 <User size={20} className="text-slate-400" />
 </div>
 </div>
 </div>
 </header>

 {/* Content Body */}
 <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-24 md:pb-8">
 <div className="max-w-7xl mx-auto space-y-6">
 {isSupported && !isSubscribed && (
 <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-md flex items-center justify-center shrink-0">
 <Bell className="w-5 h-5" />
 </div>
 <div>
 <p className="font-black text-blue-900 dark:text-blue-100 text-sm">Activez les notifications push</p>
 <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Recevez des alertes en temps réel pour vos demandes d'accès et paiements.</p>
 </div>
 </div>
 <button onClick={subscribeUser} className="shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-md transition-colors ">
 Activer
 </button>
 </div>
 )}
 
 {children}
 </div>
 </main>

 {/* Mobile Bottom Navigation */}
 <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-secondary-900 border-t border-slate-200 dark:border-secondary-800 px-2 py-3 flex items-center justify-around z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
 {links.slice(0, 4).map((link) => {
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
 <span className="text-[10px] font-black uppercase tracking-tighter">{link.mobileName || link.name}</span>
 </Link>
 );
 })}
 <button
 onClick={() => setIsMobileMenuOpen(true)}
 className="flex flex-col items-center gap-1 transition-all text-slate-400"
 >
 <div className="transition-transform">
 <MoreHorizontal size={20} />
 </div>
 <span className="text-[10px] font-black uppercase tracking-tighter">Plus</span>
 </button>
 </nav>

 {/* Mobile Menu Modal */}
 {isMobileMenuOpen && (
 <div className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end">
 <div className="bg-white dark:bg-secondary-900 w-full rounded-t-3xl p-6 shadow-2xl relative" style={{ animation: 'slideUp 0.3s ease-out forwards' }}>
 <style>{`
 @keyframes slideUp {
 from { transform: translateY(100%); }
 to { transform: translateY(0); }
 }
 `}</style>
 <button 
 onClick={() => setIsMobileMenuOpen(false)}
 className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-secondary-800 rounded-full text-slate-500 dark:text-slate-400"
 >
 <X size={20} />
 </button>
 <h3 className="font-black text-slate-900 dark:text-white mb-6 text-lg">Menu</h3>
 <div className="grid grid-cols-4 gap-4">
 {links.map((link) => {
 const isActive = location.pathname + location.search === link.path || (location.pathname === link.path && !location.search && link.name === 'Dashboard');
 return (
 <Link
 key={link.name}
 to={link.path}
 onClick={() => setIsMobileMenuOpen(false)}
 className={`flex flex-col items-center justify-start p-3 rounded-xl gap-2 transition-all ${
 isActive 
 ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500' 
 : 'bg-slate-50 dark:bg-secondary-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-secondary-700'
 }`}
 >
 {link.icon}
 <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-tight">
 {link.mobileName || link.name}
 </span>
 </Link>
 );
 })}
 </div>
 <button 
 onClick={() => {
 setIsMobileMenuOpen(false);
 handleLogout();
 }}
 className="w-full mt-6 py-4 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black rounded-xl"
 >
 <LogOut size={20} />
 Déconnexion
 </button>
 </div>
 </div>
 )}

 </div>
 </div>
 );
};

export default DashboardLayout;
