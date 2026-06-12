import React, { useState } from 'react';
import { useDashboard } from './DashboardContext';
import { CheckCircle, Zap, Shield, ArrowRight, CreditCard, AlertTriangle } from 'lucide-react';

const PLANS = [
 {
 id: "starter", name: "Starter", price: 0, displayPrice: "Gratuit", period: "", commission: "1.5%",
 color: "border-slate-200 dark:border-secondary-700", badge: null,
 features: ["50 transactions/mois", "Accès Sandbox & Production", "1 clé API", "Logs 30 jours"],
 },
 {
 id: "growth", name: "Growth", price: 10000, displayPrice: "10 000", period: "FCFA/mois", commission: "1.0%",
 color: "border-primary-500", badge: "Populaire",
 features: ["1 000 transactions/mois", "3 clés API", "Logs 90 jours", "Webhooks configurables", "Support prioritaire"],
 },
 {
 id: "pro", name: "Pro", price: 30000, displayPrice: "30 000", period: "FCFA/mois", commission: "0.8%",
 color: "border-violet-500", badge: "Meilleur ROI",
 features: ["10 000 transactions/mois", "Clés API illimitées", "Logs illimités", "Analytics détaillés", "Chat support dédié"],
 },
];

const Billing = () => {
 const { stats, headers, API, refresh, loading } = useDashboard();
 const [upgrading, setUpgrading] = useState(false);

 const handleUpgrade = async (planId, price) => {
 if (!window.confirm(`Vous êtes sur le point de souscrire au plan ${planId.toUpperCase()}.\n\nUn montant de ${price} FCFA sera débité de votre solde disponible.\n\nVoulez-vous continuer ?`)) {
 return;
 }

 setUpgrading(true);
 try {
 const res = await fetch(`${API}/developer/upgrade`, {
 method: "POST",
 headers,
 body: JSON.stringify({ plan: planId }),
 });
 const data = await res.json();
 
 if (!res.ok) throw new Error(data.error || "Erreur lors du changement de plan");
 
 // Mettre à jour le token JWT
 if (data.token) {
 localStorage.setItem("devToken", data.token);
 }
 
 alert(data.message || "Abonnement mis à jour avec succès !");
 refresh();
 } catch (e) {
 alert(e.message);
 } finally {
 setUpgrading(false);
 }
 };

 if (loading) return (
 <div className="space-y-6 animate-pulse">
 <div className="h-64 bg-slate-100 dark:bg-secondary-900 rounded-md" />
 <div className="h-48 bg-slate-100 dark:bg-secondary-900 rounded-md" />
 </div>
 );

 const currentPlan = stats?.plan || "starter";

 return (
 <div className="space-y-6">
 <div className="p-8 rounded-md bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-md flex items-center justify-center">
 <CreditCard className="w-6 h-6" />
 </div>
 <div>
 <h3 className="font-black text-slate-900 dark:text-white">Abonnement & Facturation</h3>
 <p className="text-xs text-slate-500 font-medium mt-1">Gérez votre plan et vos limites d'utilisation de l'API.</p>
 </div>
 </div>
 
 <div className="flex flex-col items-end">
 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Plan Actuel</span>
 <div className="px-4 py-2 bg-slate-100 dark:bg-secondary-800 rounded-md border border-slate-200 dark:border-secondary-700">
 <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">{currentPlan}</span>
 </div>
 </div>
 </div>

 {(stats?.balance || 0) < 10000 && currentPlan === "starter" && (
 <div className="p-4 rounded-md bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 flex items-start gap-4">
 <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
 <div>
 <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">Solde insuffisant pour un Upgrade</p>
 <p className="text-xs font-medium text-amber-700 dark:text-amber-500/80">
 Pour passer à un plan supérieur, votre solde disponible ({stats?.balance || 0} FCFA) doit couvrir le coût de l'abonnement. 
 Générez des transactions réelles en production pour augmenter votre solde.
 </p>
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {PLANS.map((plan) => {
 const isCurrent = currentPlan === plan.id;
 return (
 <div key={plan.id} className={`relative flex flex-col p-6 rounded-md bg-white dark:bg-secondary-900 border-2 transition-all duration-300 ${isCurrent ? 'border-primary-500 ring-4 ring-primary-500/20' : plan.color}`}>
 {plan.badge && !isCurrent && (
 <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black rounded-full whitespace-nowrap">{plan.badge}</span>
 )}
 {isCurrent && (
 <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 text-white text-[10px] font-black rounded-full whitespace-nowrap">Plan Actuel</span>
 )}
 
 <p className="font-black text-slate-900 dark:text-white text-xl mb-1">{plan.name}</p>
 <div className="flex items-end gap-1 mb-1">
 <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.displayPrice}</span>
 <span className="text-slate-400 text-xs font-bold pb-1">{plan.period}</span>
 </div>
 <p className="text-primary-600 dark:text-primary-400 text-xs font-bold mb-6">Commission : {plan.commission}</p>
 
 <div className="h-px bg-slate-100 dark:bg-secondary-800 mb-6" />
 
 <ul className="space-y-3 mb-8 flex-grow">
 {plan.features.map((feat, j) => (
 <li key={j} className="flex items-start gap-3 text-xs text-slate-600 dark:text-gray-300 font-medium">
 <CheckCircle className="w-4 h-4 text-primary-500 shrink-0" />
 {feat}
 </li>
 ))}
 </ul>
 
 <button 
 onClick={() => handleUpgrade(plan.id, plan.price)}
 disabled={isCurrent || upgrading || (plan.price > 0 && (stats?.balance || 0) < plan.price)}
 className={`w-full py-3 rounded-md font-black text-xs transition-all ${
 isCurrent 
 ? "bg-slate-100 dark:bg-secondary-800 text-slate-400 cursor-not-allowed" 
 : "bg-slate-900 hover:bg-slate-800 dark:bg-primary-500 dark:hover:bg-primary-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
 }`}
 >
 {isCurrent ? "Actif" : upgrading ? "Traitement..." : `Passer à ${plan.name}`}
 </button>
 </div>
 )
 })}
 </div>
 
 </div>
 );
};

export default Billing;
