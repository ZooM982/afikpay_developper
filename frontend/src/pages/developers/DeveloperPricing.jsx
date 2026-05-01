import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Zap, Shield, Globe, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    name: "Starter", price: "Gratuit", period: "", commission: "1.5%",
    color: "border-slate-200 dark:border-secondary-700", badge: null,
    cta: "Commencer gratuitement",
    features: ["50 transactions/mois", "Accès Sandbox & Production", "1 clé API", "Logs 30 jours", "Documentation complète"],
  },
  {
    name: "Growth", price: "10 000", period: "FCFA/mois", commission: "1.0%",
    color: "border-primary-500", badge: "Populaire",
    cta: "Démarrer Growth",
    features: ["1 000 transactions/mois", "3 clés API", "Logs 90 jours", "Webhooks configurables", "Support prioritaire"],
  },
  {
    name: "Pro", price: "30 000", period: "FCFA/mois", commission: "0.8%",
    color: "border-violet-500", badge: "Meilleur ROI",
    cta: "Passer Pro",
    features: ["10 000 transactions/mois", "Clés API illimitées", "Logs illimités", "Analytics détaillés", "Chat support dédié"],
  },
  {
    name: "Enterprise", price: "Sur devis", period: "", commission: "Négociable",
    color: "border-amber-500", badge: null,
    cta: "Nous contacter",
    features: ["Transactions illimitées", "SLA 99.9% garanti", "IP whitelist", "Account manager", "Facturation personnalisée"],
  },
];

const DeveloperPricing = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-secondary-950 font-sans">
      {/* Header Section */}
      <section className="py-20 bg-slate-50 dark:bg-secondary-900/30 border-b border-slate-100 dark:border-secondary-900">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            Des tarifs clairs pour <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">votre croissance</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Choisissez le plan qui correspond à votre stade de développement. 
            Aucun frais caché, une transparence totale sur chaque transaction.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {PLANS.map((plan, i) => (
              <div key={i} className={`relative flex flex-col p-8 rounded-3xl bg-white dark:bg-secondary-900 border-2 ${plan.color} hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}>
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 text-white text-xs font-black rounded-full shadow-lg whitespace-nowrap">{plan.badge}</span>
                )}
                <p className="font-black text-slate-900 dark:text-white text-xl mb-1">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-slate-400 text-sm font-bold pb-1">{plan.period}</span>
                </div>
                <p className="text-primary-600 dark:text-primary-400 text-xs font-bold mb-6">Commission : {plan.commission} / txn</p>
                <div className="h-px bg-slate-100 dark:bg-secondary-800 mb-6" />
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-slate-600 dark:text-gray-300 font-medium leading-tight">
                      <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link to="/register"
                  className={`w-full text-center py-4 rounded-2xl font-black text-sm transition-all ${plan.badge ? "bg-primary-500 hover:bg-primary-400 text-white shadow-xl shadow-primary-500/20" : "bg-slate-100 dark:bg-secondary-800 hover:bg-slate-200 dark:hover:bg-secondary-700 text-slate-900 dark:text-white"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison / FAQ info */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0"><Shield className="w-6 h-6 text-primary-400" /></div>
              <h3 className="text-lg font-black mb-3">Sécurité incluse</h3>
              <p className="text-slate-400 text-sm font-medium">Tous les plans bénéficient du même niveau de sécurité bancaire et de cryptage.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0"><Zap className="w-6 h-6 text-primary-400" /></div>
              <h3 className="text-lg font-black mb-3">Pas de frais fixes</h3>
              <p className="text-slate-400 text-sm font-medium">Sur le plan Starter, vous ne payez que si vous transférez de l'argent. Pas d'abonnement.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0"><Globe className="w-6 h-6 text-primary-400" /></div>
              <h3 className="text-lg font-black mb-3">Multi-devises</h3>
              <p className="text-slate-400 text-sm font-medium">Gérez vos paiements en XOF, XAF, GNF et plus encore depuis le même compte.</p>
            </div>
          </div>
          
          <div className="mt-20 p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
            <h2 className="text-2xl font-black mb-4">Besoin d'un volume plus important ?</h2>
            <p className="text-slate-400 mb-8 font-medium">Si vous traitez plus de 100 000 transactions par mois, contactez notre équipe commerciale pour un tarif sur mesure.</p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all">
              Contacter le support <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DeveloperPricing;
