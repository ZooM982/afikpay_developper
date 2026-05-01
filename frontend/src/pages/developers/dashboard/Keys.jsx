import React, { useState } from 'react';
import { useDashboard } from './DashboardContext';
import { Key, Copy, Eye, EyeOff, RefreshCw, Trash2, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

const Keys = () => {
  const { keys, setKeys, headers, API, refresh, loading } = useDashboard();
  const [showKey, setShowKey] = useState({});
  const [copied, setCopied] = useState("");
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newEnv, setNewEnv] = useState("live");
  const [justCreated, setJustCreated] = useState(null);

  if (loading) return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-pulse">
      <div className="xl:col-span-2 space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-secondary-900 rounded-3xl" />)}
      </div>
      <div className="h-64 bg-slate-100 dark:bg-secondary-900 rounded-3xl" />
    </div>
  );

  const copyKey = (val, id) => {
    navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const createKey = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch(`${API}/developer/keys`, {
        method: "POST",
        headers,
        body: JSON.stringify({ label: newLabel, environment: newEnv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJustCreated(data.apiKey);
      setNewLabel("");
      refresh();
    } catch (e) { alert(e.message); }
    finally { setCreating(false); }
  };

  const deleteKey = async (id) => {
    if (!confirm("Supprimer cette clé ?")) return;
    try {
      const res = await fetch(`${API}/developer/keys/${id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Erreur");
      refresh();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      {justCreated && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 animate-scale-in">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-amber-800 dark:text-amber-300">Copiez votre clé maintenant — elle ne sera plus affichée !</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-1">Pour des raisons de sécurité, la clé complète n'est visible qu'une seule fois.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <code className="flex-1 px-4 py-3 bg-amber-900/20 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-xl text-sm font-mono break-all">{justCreated}</code>
            <button onClick={() => copyKey(justCreated, "created")}
              className="shrink-0 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-black transition-colors flex items-center gap-2">
              {copied === "created" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === "created" ? "Copié" : "Copier"}
            </button>
          </div>
          <button onClick={() => setJustCreated(null)} className="mt-3 text-xs text-amber-600 hover:text-amber-800 font-bold">J'ai copié ma clé, fermer</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {keys.map((k) => (
            <div key={k._id} className="p-6 bg-white dark:bg-secondary-900 rounded-3xl border border-slate-100 dark:border-secondary-800 shadow-sm group hover:border-primary-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.environment === 'live' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-slate-100 text-slate-600 dark:bg-secondary-800'}`}>
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white">{k.label}</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Dernière utilisation: {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Jamais'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${k.environment === 'live' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-secondary-800'}`}>
                    {k.environment}
                  </span>
                  <button onClick={() => deleteKey(k._id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-secondary-800 p-3 rounded-xl border border-slate-100 dark:border-secondary-700">
                <code className="flex-1 font-mono text-xs text-slate-600 dark:text-gray-300 truncate">
                  {showKey[k._id] ? k.hashedKey : `sk_${k.environment}_••••••••••••••••••••••••••••••••`}
                </code>
                <div className="flex items-center gap-1">
                  <button onClick={() => copyKey(k.environment === 'live' ? 'Veuillez générer une nouvelle clé pour voir le secret' : k.hashedKey, k._id)} className="p-2 text-slate-400 hover:text-primary-500 transition-colors">
                    {copied === k._id ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {keys.length === 0 && (
            <div className="py-20 text-center bg-slate-50 dark:bg-secondary-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-secondary-800">
              <Key className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Vous n'avez pas encore de clé API</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-secondary-900 p-8 rounded-3xl border border-slate-100 dark:border-secondary-800 shadow-sm h-fit sticky top-24">
          <h3 className="font-black text-slate-900 dark:text-white mb-6">Nouvelle clé API</h3>
          <form onSubmit={createKey} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Libellé</label>
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
                placeholder="Ex: App Mobile Prod" required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-secondary-800 border border-slate-200 dark:border-secondary-700 text-sm font-medium focus:border-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Environnement</label>
              <div className="grid grid-cols-2 gap-2">
                {['test', 'live'].map(env => (
                  <button key={env} type="button" onClick={() => setNewEnv(env)}
                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${newEnv === env ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-slate-100 dark:border-secondary-800 text-slate-400'}`}>
                    {env}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={creating}
              className="w-full py-4 bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 mt-4">
              {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Générer la clé
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Keys;
