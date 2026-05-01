import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Key, BookOpen, ExternalLink, Github } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Produits', path: '/#products' },
    { name: 'Documentation', path: '/docs', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Tarifs', path: '/pricing' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 dark:bg-secondary-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-secondary-800 py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:rotate-6 transition-transform">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">AfriKPay</span>
            <span className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest -mt-1">Developers</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`text-sm font-bold flex items-center gap-2 transition-colors ${
                location.pathname === link.path 
                  ? 'text-primary-500' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-primary-500'
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-colors">
            Connexion
          </Link>
          <Link 
            to="/register" 
            className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-slate-900/10 dark:shadow-white/10"
          >
            Créer un compte
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-secondary-900 border-b border-slate-200 dark:border-secondary-800 p-4 space-y-4 animate-in fade-in slide-in-from-top-4">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block text-lg font-bold text-slate-900 dark:text-white"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <Link to="/login" onClick={() => setIsOpen(false)} className="w-full py-3 text-center text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-secondary-700 rounded-xl">
              Connexion
            </Link>
            <Link to="/register" onClick={() => setIsOpen(false)} className="w-full py-3 text-center bg-primary-500 text-white font-black rounded-xl">
              S'inscrire
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
