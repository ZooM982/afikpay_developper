import React, { useState, useEffect } from 'react';
import { useDashboard } from './DashboardContext';
import { Zap, Shield, CheckCircle, Copy } from 'lucide-react';

const Webhooks = () => {
  const { stats, headers, API, refresh, loading } = useDashboard();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState("");

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-64 bg-slate-100 dark:bg-secondary-900 rounded-3xl" />
      <div className="h-48 bg-slate-100 dark:bg-secondary-900 rounded-3xl" />
    </div>
  );

  useEffect(() => {
    if (stats?.webhookUrl) setWebhookUrl(stats.webhookUrl);
  }, [stats]);

  const updateWebhook = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`${API}/developer/webhook`, {
        method: "POST",
        headers,
        body: JSON.stringify({ webhookUrl }),
      });
      if (!res.ok) throw new Error("Erreur");
      alert("Configuration mise à jour");
      refresh();
    } catch (e) { alert(e.message); }
    finally { setUpdating(false); }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(stats?.webhookSecret);
    setCopied("secret");
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-8 rounded-3xl bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-2xl flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white">Configuration Webhook</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Notification en temps réel</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Endpoint URL</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                value={webhookUrl} 
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://votre-site.com/api/webhook"
                className="flex-1 px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-secondary-800 border border-slate-200 dark:border-secondary-700 text-sm font-medium outline-none focus:border-primary-500"
              />
              <button 
                onClick={updateWebhook}
                disabled={updating}
                className="px-8 py-3.5 bg-primary-500 hover:bg-primary-400 text-white font-black rounded-2xl transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
              >
                {updating ? "Mise à jour..." : "Enregistrer"}
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-amber-600 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest mb-1">Secret Webhook</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-4">Utilisez ce secret pour vérifier l'authenticité des notifications via le header `X-AfriKPay-Signature`.</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-3 bg-white/50 dark:bg-black/20 text-amber-900 dark:text-amber-100 rounded-xl text-xs font-mono border border-amber-200/50 dark:border-amber-800/20 break-all">
                    {stats?.webhookSecret || "••••••••••••••••••••••••••••••••"}
                  </code>
                  <button onClick={copySecret} className="p-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl transition-all shadow-lg shadow-amber-500/20">
                    {copied === "secret" ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800 shadow-sm">
        <h4 className="font-black text-slate-900 dark:text-white mb-6">Événements supportés</h4>
        <div className="space-y-3">
          {[
            { event: "transfer.created", desc: "Envoyé dès la création d'une demande de transfert." },
            { event: "transfer.completed", desc: "Envoyé lorsque le transfert est confirmé par l'opérateur (Bientôt)." },
            { event: "transfer.failed", desc: "Envoyé si le transfert échoue (Bientôt)." }
          ].map(ev => (
            <div key={ev.event} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-secondary-800/50 transition-colors">
              <code className="text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-1 rounded-md font-mono">{ev.event}</code>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">{ev.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Webhooks;
