import React, { useState } from 'react';
import { useDashboard } from './DashboardContext';
import { Globe, Shield, CheckCircle, Clock, Plus } from 'lucide-react';

const Countries = () => {
  const { availableCountries, headers, API, refresh, loading } = useDashboard();
  const [requestingCountries, setRequestingCountries] = useState(false);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-secondary-900 rounded-3xl" />)}
    </div>
  );

  const requestCountries = async () => {
    setRequestingCountries(true);
    try {
      const res = await fetch(`${API}/developer/countries/request`, {
        method: "POST",
        headers,
        body: JSON.stringify({ countryCodes: availableCountries.filter(c => c.status === 'not_requested').map(c => c.code) })
      });
      if (!res.ok) throw new Error("Erreur");
      refresh();
    } catch (e) { alert(e.message); }
    finally { setRequestingCountries(false); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Pays & Services</h3>
          <p className="text-sm text-slate-500 font-medium">Gérez vos zones d'opération et demandez de nouveaux accès.</p>
        </div>
        <button onClick={requestCountries} disabled={requestingCountries}
          className="px-6 py-3 bg-primary-500 hover:bg-primary-400 text-white font-black rounded-2xl transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2 text-sm disabled:opacity-50">
          <Plus className="w-4 h-4" /> Demander tous les pays
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableCountries.map((c) => (
          <div key={c.code} className="p-6 bg-white dark:bg-secondary-900 rounded-3xl border border-slate-100 dark:border-secondary-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{c.flag}</span>
                <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                  c.status === 'authorized' ? 'bg-emerald-100 text-emerald-700' :
                  c.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {c.status === 'authorized' ? 'Activé' : c.status === 'pending' ? 'En attente' : 'Non demandé'}
                </span>
              </div>
              <h4 className="font-black text-slate-900 dark:text-white mb-1">{c.name}</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">{c.currency}</p>
              
              <div className="space-y-2">
                {c.mobileMoneyProviders?.map(op => (
                  <div key={op.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-secondary-800 border border-slate-100 dark:border-secondary-700">
                    <span className="text-xs font-bold text-slate-600 dark:text-gray-300">{op.name}</span>
                    <span className="text-[10px] font-black text-primary-500">{op.payOutFee}% txn</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-secondary-800">
              {c.status === 'authorized' ? (
                <div className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase">
                  <CheckCircle className="w-4 h-4" /> Prêt pour production
                </div>
              ) : c.status === 'pending' ? (
                <div className="flex items-center gap-2 text-amber-500 text-xs font-black uppercase">
                  <Clock className="w-4 h-4" /> Approbation en cours
                </div>
              ) : (
                <button className="text-primary-500 text-xs font-black uppercase hover:underline">Demander l'accès</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Countries;
