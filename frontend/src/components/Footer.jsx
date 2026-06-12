import React from 'react';
import { Link } from 'react-router-dom';
import { Key, Github, Twitter, Linkedin, Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: 'Produit',
      links: [
        { name: 'Fonctionnalités', path: '/#features' },
        { name: 'Tarifs', path: '/pricing' },
        { name: 'Documentation', path: '/docs' },
        { name: 'API Reference', path: '/docs/api' },
      ]
    },
    {
      title: 'Ressources',
      links: [
        { name: 'Communauté', path: '#' },
        { name: 'Statut API', path: '#' },
        { name: 'Open Source', path: '#' },
        { name: 'Blog Tech', path: '#' },
      ]
    },
    {
      title: 'Légal',
      links: [
        { name: 'Confidentialité', path: '#' },
        { name: 'CGU / CGV', path: '#' },
        { name: 'Cookies', path: '#' },
        { name: 'Sécurité', path: '#' },
      ]
    }
  ];

  return (
    <footer className="bg-white dark:bg-secondary-950 border-t border-slate-100 dark:border-secondary-900 pt-16 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo.png" alt="AfrikPay" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">AfriKPay</span>
                <span className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest -mt-1">Merchants</span>
              </div>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium leading-relaxed">
              La plateforme de paiement nouvelle génération pour les Marchands africains. 
              Intégrez les paiements mobiles et bancaires en quelques minutes.
            </p>
            <div className="flex items-center gap-4">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg bg-slate-50 dark:bg-secondary-900 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-100 dark:border-secondary-900 gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-xs font-bold text-slate-400">
              © {currentYear} AfriKPay Merchants Portal.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
