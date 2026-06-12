import React, { useState } from 'react';
import { useDashboard } from './DashboardContext';
import { Key, Copy, Eye, EyeOff, RefreshCw, Trash2, Plus, CheckCircle, AlertTriangle, CreditCard } from 'lucide-react';

const Keys = () => {
 const { keys, setKeys, headers, API, refresh, loading } = useDashboard();
 const [showKey, setShowKey] = useState({});
 const [copied, setCopied] = useState("");
 const [creating, setCreating] = useState(false);
 const [newLabel, setNewLabel] = useState('');
 const [newEnv, setNewEnv] = useState('test');
 const [loadingTest, setLoadingTest] = useState(false);
 const [justCreated, setJustCreated] = useState(null);

 if (loading) return (
 <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-pulse">
 <div className="xl:col-span-2 space-y-4">
 {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-secondary-900 rounded-md" />)}
 </div>
 <div className="h-64 bg-slate-100 dark:bg-secondary-900 rounded-md" />
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
 setJustCreated(data.rawKey);
 setNewLabel("");
 refresh();
 } catch (e) { alert(e.message); }
 finally { setCreating(false); }
 };

 const deleteKey = async (id) => {
 if (!confirm("Voulez-vous vraiment révoquer et supprimer cette clé ? Elle ne pourra plus être utilisée.")) return;
 try {
 const res = await fetch(`${API}/developer/keys/${id}`, { method: "DELETE", headers });
 if (!res.ok) throw new Error("Erreur lors de la suppression");
 refresh();
 } catch (e) { alert(e.message); }
 };

 // Filtrer les clés révoquées
 const activeKeys = keys.filter(k => k.status !== "revoked");

 return (
 <div className="space-y-6">
 {justCreated && (
 <div className="p-5 rounded-md bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 animate-scale-in">
 <div className="flex items-start gap-3 mb-3">
 <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
 <div>
 <h4 className="font-black text-amber-900 dark:text-amber-500 text-sm">Stockez cette clé secrète en lieu sûr !</h4>
 <p className="text-xs font-medium text-amber-700 dark:text-amber-600/80 mt-1">
 Pour des raisons de sécurité, cette clé ne sera <strong>plus jamais affichée</strong>. Si vous la perdez, vous devrez en générer une nouvelle.
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2 bg-white dark:bg-amber-950/50 p-2 rounded-md border border-amber-200 dark:border-amber-800">
 <code className="flex-1 font-mono text-sm text-slate-800 dark:text-amber-100 px-2">{justCreated}</code>
 <button onClick={() => copyKey(justCreated, "created")}
 className="shrink-0 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-md text-sm font-black transition-colors flex items-center gap-2">
 {copied === "created" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
 {copied === "created" ? "Copié" : "Copier"}
 </button>
 </div>
 <button onClick={() => setJustCreated(null)} className="mt-3 text-xs text-amber-600 hover:text-amber-800 font-bold">J'ai copié ma clé, fermer</button>
 </div>
 )}

 <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
 <div className="xl:col-span-2 space-y-4">
 {activeKeys.map((k) => (
 <div key={k._id} className="p-6 bg-white dark:bg-secondary-900 rounded-md border border-slate-100 dark:border-secondary-800 group hover:border-primary-500/50 transition-all">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-3">
 <div className={`w-10 h-10 rounded-md flex items-center justify-center ${k.environment === 'live' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-slate-100 text-slate-600 dark:bg-secondary-800'}`}>
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
 <button onClick={() => deleteKey(k._id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>

 <div className="flex items-center gap-2 bg-slate-50 dark:bg-secondary-800 p-3 rounded-md border border-slate-100 dark:border-secondary-700 mb-4">
 <code className="flex-1 font-mono text-xs text-slate-600 dark:text-gray-300 truncate">
 {showKey[k._id] ? k.hashedKey : `sk_${k.environment}_••••••••••••••••••••••••••••••••`}
 </code>
 <div className="flex items-center gap-1">
 <button onClick={() => copyKey(k.environment === 'live' ? 'Veuillez générer une nouvelle clé pour voir le secret' : k.hashedKey, k._id)} className="p-2 text-slate-400 hover:text-primary-500 transition-colors">
 {copied === k._id ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
 </button>
 </div>
 </div>

 {/* Quota Progress Bar */}
 <div className="px-1">
 <div className="flex items-center justify-between text-xs font-bold mb-2">
 <span className="text-slate-500">Utilisation mensuelle</span>
 <span className={k.usedThisMonth >= k.quotaMonthly ? "text-red-500" : "text-slate-700 dark:text-slate-300"}>
 {k.usedThisMonth || 0} / {k.quotaMonthly || 0}
 </span>
 </div>
 <div className="w-full bg-slate-100 dark:bg-secondary-800 rounded-full h-1.5 overflow-hidden">
 <div 
 className={`h-full rounded-full transition-all duration-500 ${k.usedThisMonth >= k.quotaMonthly ? 'bg-red-500' : 'bg-primary-500'}`}
 style={{ width: `${Math.min(((k.usedThisMonth || 0) / (k.quotaMonthly || 1)) * 100, 100)}%` }}
 />
 </div>
 {k.usedThisMonth >= k.quotaMonthly && (
 <p className="text-[10px] text-red-500 font-bold mt-2">⚠️ Quota atteint, requêtes bloquées.</p>
 )}
 </div>
 </div>
 ))}
 {keys.length === 0 && (
 <div className="py-20 text-center bg-slate-50 dark:bg-secondary-900/50 rounded-md border-2 border-dashed border-slate-200 dark:border-secondary-800">
 <Key className="w-12 h-12 text-slate-300 mx-auto mb-4" />
 <p className="text-slate-400 font-medium">Vous n'avez pas encore de clé API</p>
 </div>
 )}
 </div>

 <div className="space-y-6 sticky top-24">
 <div className="bg-white dark:bg-secondary-900 p-8 rounded-md border border-slate-100 dark:border-secondary-800 ">
 <h3 className="font-black text-slate-900 dark:text-white mb-6">Nouvelle clé API</h3>
 <form onSubmit={createKey} className="space-y-4">
 <div>
 <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Libellé</label>
 <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
 placeholder="Ex: App Mobile Prod" required
 className="w-full px-4 py-3 rounded-md bg-slate-50 dark:bg-secondary-800 border border-slate-200 dark:border-secondary-700 text-sm font-medium focus:border-primary-500 outline-none" />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Environnement</label>
 <div className="grid grid-cols-2 gap-2">
 {['test', 'live'].map(env => (
 <button key={env} type="button" onClick={() => setNewEnv(env)}
 className={`py-3 rounded-md text-xs font-black uppercase tracking-widest border-2 transition-all ${newEnv === env ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-slate-100 dark:border-secondary-800 text-slate-400'}`}>
 {env}
 </button>
 ))}
 </div>
 </div>
 <button type="submit" disabled={creating}
 className="w-full py-4 bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-white font-black rounded-md transition-all flex items-center justify-center gap-2 mt-4">
 {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
 Générer la clé
 </button>
 </form>
 </div>

 <div className="bg-slate-900 p-8 rounded-md border border-slate-800 relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 " />
 <h3 className="font-black text-white mb-2 flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
 Test API Live (500 FCFA)
 </h3>
 <p className="text-xs text-slate-400 font-medium mb-6">Testez l'expérience de paiement que vos clients verront. Collez votre clé secrète ci-dessous pour lancer la démo.</p>
 
 <form onSubmit={async (e) => {
 e.preventDefault();
 const key = e.target.testKey.value;
 if (!key) return;
 
 setLoadingTest(true);

 try {
 const res = await fetch(`${API}/v1/checkout/sessions`, {
 method: "POST",
 headers: { 
 "Authorization": `Bearer ${key.trim()}`, 
 "Content-Type": "application/json" 
 },
 body: JSON.stringify({ 
 amount: 500, 
 currency: "XOF", 
 successUrl: window.location.href,
 cancelUrl: window.location.href
 })
 });
 
 const data = await res.json();
 if(!res.ok) throw new Error(data.error || "Erreur réseau");
 
 // Vraie redirection !
 window.location.href = data.url;
 } catch(err) {
 alert("Erreur: " + err.message);
 setLoadingTest(false);
 }
 }} className="space-y-4">
 <div>
 <input name="testKey" placeholder="sk_live_..." defaultValue={justCreated || ""} required
 className="w-full px-4 py-3 rounded-md bg-slate-800 border border-slate-700 text-white text-sm font-mono focus:border-emerald-500 outline-none" />
 </div>
 <button type="submit" disabled={loadingTest}
 className="w-full py-4 px-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-black rounded-md transition-all flex flex-col sm:flex-row items-center justify-center gap-2">
 {loadingTest ? <RefreshCw className="w-5 h-5 flex-shrink-0 animate-spin" /> : <CreditCard className="w-5 h-5 flex-shrink-0" />}
 <span className="text-center sm:text-left leading-tight">{loadingTest ? "Création..." : "Lancer le Checkout (500 FCFA)"}</span>
 </button>
 </form>
 </div>
 </div>
 </div>
 </div>
 );
};

export default Keys;
