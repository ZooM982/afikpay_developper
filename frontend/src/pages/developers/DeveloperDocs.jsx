// pages/developers/DeveloperDocs.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Key, Copy, CheckCircle, ChevronRight, ChevronDown } from "lucide-react";
import { countries } from "../../config/countries";

const TABS = ["Démarrage rapide", "Endpoints", "Frais & Pays", "Webhooks", "Erreurs"];

const CODE = {
  auth: `// Header requis sur tous les appels
Authorization: Bearer sk_live_VOTRE_CLE_API`,

  transfer: `// POST /api/v1/transfer
const res = await fetch('https://api.afrikpay.tech/api/v1/transfer', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_live_VOTRE_CLE_API',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 50000,           // Montant en XOF
    currency: 'XOF',
    recipientPhone: '+221771234567',
    recipientName: 'Fatou Diallo',
    countryCode: 'SN',
    operator: 'wave'         // wave | orange_money | free_money
  })
});

// Réponse 201
{
  "transactionId": "TXN_6a3f9b2c",
  "status": "pending",
  "amount": 50000,
  "fee": 1200,
  "netAmount": 48800,
  "currency": "XOF",
  "operator": "wave",
  "recipientPhone": "+221771234567",
  "createdAt": "2026-04-22T09:00:00.000Z"
}`,

  status: `// GET /api/v1/transfer/:id
const res = await fetch(
  'https://api.afrikpay.tech/api/v1/transfer/TXN_6a3f9b2c',
  { headers: { 'Authorization': 'Bearer sk_live_VOTRE_CLE_API' } }
);

// Réponse
{
  "transactionId": "TXN_6a3f9b2c",
  "status": "completed",   // pending | processing | completed | failed
  "completedAt": "2026-04-22T09:02:15.000Z"
}`,

  countries: `// GET /api/v1/countries
// Retourne tous les pays et opérateurs disponibles
[
  {
    "code": "SN",
    "name": "Sénégal",
    "currency": "XOF",
    "phoneCode": "+221",
    "operators": [
      { "name": "wave",         "payInFee": 2.4, "payOutFee": 2.4 },
      { "name": "orange_money", "payInFee": 2.4, "payOutFee": 2.4 },
      { "name": "free_money",   "payInFee": 2.4, "payOutFee": 2.4 }
    ]
  }
]`,

  webhook: `// Configurez votre endpoint dans le dashboard
// AfriKPay enverra un POST HTTP sur votre URL à chaque événement

// Payload reçu
{
  "event": "transfer.completed",
  "transactionId": "TXN_6a3f9b2c",
  "status": "completed",
  "amount": 50000,
  "fee": 1200,
  "timestamp": "2026-04-22T09:02:15.000Z",
  "signature": "sha256=abc123..."  // Vérifiez avec votre webhook_secret
}

// Vérification de la signature (Node.js)
const crypto = require('crypto');
const sig = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');
if (sig !== receivedSignature) throw new Error('Signature invalide');`,

  errors: `// Codes d'erreur courants
{
  "401": "Clé API manquante ou invalide",
  "403": "Quota mensuel dépassé — upgradez votre plan",
  "400": "Paramètres invalides (détail dans 'message')",
  "422": "Opérateur non disponible pour ce pays",
  "429": "Rate limit atteint — max 1000 req/15min",
  "500": "Erreur serveur — contactez le support"
}`,
};

const CodeBlock = ({ code, id }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex gap-1.5">
          {["bg-red-500","bg-yellow-500","bg-green-500"].map(c=>(
            <span key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />
          ))}
        </div>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <pre className="p-5 text-sm font-mono text-slate-300 overflow-x-auto leading-6 whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const Section = ({ title, children, id }) => (
  <div id={id} className="mb-16">
    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
      <span className="w-1 h-7 bg-primary-500 rounded-full inline-block" />
      {title}
    </h2>
    {children}
  </div>
);

const DeveloperDocs = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openCountry, setOpenCountry] = useState("SN");

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-950 font-sans pt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest">
          <Link to="/" className="hover:text-primary-500 transition-colors">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 dark:text-slate-300">Documentation</span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Sidebar nav */}
          <aside className="lg:w-56 shrink-0">
            <nav className="sticky top-20 space-y-1">
              {TABS.map((t, i) => (
                <a key={i} href={`#section-${i}`} onClick={() => setActiveTab(i)}
                  className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === i ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600" : "text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-secondary-800/50 hover:text-slate-700 dark:hover:text-gray-300"}`}>
                  {t}
                  {activeTab === i && <ChevronRight className="w-4 h-4" />}
                </a>
              ))}
              <div className="pt-6 border-t border-slate-100 dark:border-secondary-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Ressources</p>
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors">
                  <Key className="w-4 h-4" /> Mes clés API
                </Link>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">

            {/* ── 0. Démarrage rapide ── */}
            <Section title="Démarrage rapide" id="section-0">
              <div className="p-5 rounded-2xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 mb-6">
                <p className="text-sm font-bold text-primary-800 dark:text-primary-300">
                  L'API AfriKPay vous permet d'initier des transferts Mobile Money vers 13 pays d'Afrique. Base URL :
                </p>
                <code className="text-primary-700 dark:text-primary-400 font-mono text-sm mt-1 block">
                  https://api.afrikpay.tech
                </code>
              </div>

              <h3 className="text-base font-black text-slate-900 dark:text-white mb-3">1. Authentification</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-3 font-medium">Toutes les requêtes nécessitent votre clé API dans le header HTTP :</p>
              <CodeBlock code={CODE.auth} id="auth" />

              <h3 className="text-base font-black text-slate-900 dark:text-white mt-8 mb-3">2. Premier transfert</h3>
              <CodeBlock code={CODE.transfer} id="transfer-example" />

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Frais AfriKPay", value: "Dès 0.8%", color: "text-primary-600" },
                  { label: "Délai de traitement", value: "2 à 15 min", color: "text-emerald-600" },
                  { label: "Horaires", value: "06h – 23h59", color: "text-blue-600" },
                ].map(s => (
                  <div key={s.label} className="p-4 rounded-2xl bg-slate-50 dark:bg-secondary-900/50 border border-slate-100 dark:border-secondary-800 text-center">
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-400 font-bold mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── 1. Endpoints ── */}
            <Section title="Endpoints" id="section-1">
              {[
                { method: "POST", path: "/api/v1/transfer", desc: "Initier un transfert", code: CODE.transfer, color: "bg-emerald-500" },
                { method: "GET", path: "/api/v1/transfer/:id", desc: "Vérifier le statut", code: CODE.status, color: "bg-blue-500" },
                { method: "GET", path: "/api/v1/countries", desc: "Pays & opérateurs", code: CODE.countries, color: "bg-blue-500" },
              ].map((ep, i) => (
                <div key={i} className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`${ep.color} text-white text-xs font-black px-2.5 py-1 rounded-lg font-mono`}>{ep.method}</span>
                    <code className="text-slate-700 dark:text-gray-300 font-mono text-sm">{ep.path}</code>
                    <span className="text-slate-400 text-sm">— {ep.desc}</span>
                  </div>
                  <CodeBlock code={ep.code} id={`ep-${i}`} />
                </div>
              ))}
            </Section>

            {/* ── 2. Frais & Pays ── */}
            <Section title="Frais par pays & opérateur" id="section-2">
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-6 font-medium">
                Frais AfriKPay : <strong className="text-slate-900 dark:text-white">Variables selon votre plan</strong> (1.5% Starter, 1.0% Growth, 0.8% Pro) sur le montant envoyé.
                Les frais opérateurs ci-dessous s'ajoutent côté bénéficiaire.
              </p>

              <div className="space-y-3">
                {countries.map(country => (
                  <div key={country.code} className="rounded-2xl border border-slate-100 dark:border-secondary-800 overflow-hidden">
                    <button
                      onClick={() => setOpenCountry(openCountry === country.code ? null : country.code)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-secondary-900 hover:bg-slate-50 dark:hover:bg-secondary-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{country.flag}</span>
                        <div className="text-left">
                          <p className="font-black text-slate-900 dark:text-white text-sm">{country.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{country.phoneCode} · {country.currency}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400">{country.mobileMoneyProviders.length} opérateur{country.mobileMoneyProviders.length > 1 ? "s" : ""}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openCountry === country.code ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {openCountry === country.code && (
                      <div className="border-t border-slate-100 dark:border-secondary-800">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 dark:bg-secondary-800/50">
                            <tr>
                              {["Opérateur", "Clé API (operator)", "Frais entrée", "Frais sortie"].map(h => (
                                <th key={h} className="px-5 py-2.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-secondary-800">
                            {country.mobileMoneyProviders.map((op, j) => {
                              const key = op.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
                              return (
                                <tr key={j} className="bg-white dark:bg-secondary-900">
                                  <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{op.name}</td>
                                  <td className="px-5 py-3"><code className="text-xs bg-slate-100 dark:bg-secondary-800 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-md font-mono">{key}</code></td>
                                  <td className="px-5 py-3 text-slate-600 dark:text-gray-300 font-mono">{op.payInFee}%</td>
                                  <td className="px-5 py-3 text-slate-600 dark:text-gray-300 font-mono">{op.payOutFee}%</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div className="px-5 py-3 bg-slate-50 dark:bg-secondary-800/30 text-xs text-slate-400 font-medium">
                          Code pays : <code className="font-mono text-slate-600 dark:text-gray-400">"{country.code}"</code>
                          &nbsp;· Longueur tél. : <code className="font-mono text-slate-600 dark:text-gray-400">{country.phoneLength} chiffres</code>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>

            {/* ── 3. Webhooks ── */}
            <Section title="Webhooks" id="section-3">
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-6 font-medium">
                Configurez un webhook pour recevoir les notifications de statut en temps réel sur votre serveur.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { event: "transfer.pending", desc: "Transfert créé, en attente de paiement" },
                  { event: "transfer.processing", desc: "Paiement reçu, traitement en cours" },
                  { event: "transfer.completed", desc: "Fonds crédités chez le bénéficiaire" },
                  { event: "transfer.failed", desc: "Échec du transfert" },
                ].map(ev => (
                  <div key={ev.event} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-secondary-900/50 border border-slate-100 dark:border-secondary-800">
                    <code className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2.5 py-1 rounded-lg font-mono shrink-0">{ev.event}</code>
                    <span className="text-sm text-slate-600 dark:text-gray-300 font-medium">{ev.desc}</span>
                  </div>
                ))}
              </div>
              <CodeBlock code={CODE.webhook} id="webhook" />
            </Section>

            {/* ── 4. Erreurs ── */}
            <Section title="Codes d'erreur" id="section-4">
              <CodeBlock code={CODE.errors} id="errors" />
              <div className="mt-8 p-5 rounded-2xl bg-slate-50 dark:bg-secondary-900/50 border border-slate-100 dark:border-secondary-800">
                <p className="text-sm font-black text-slate-900 dark:text-white mb-2">Besoin d'aide ?</p>
                <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">
                  Consultez votre{" "}
                  <Link to="/dashboard" className="text-primary-600 font-bold hover:underline">dashboard</Link>{" "}
                  pour voir vos logs d'erreurs, ou{" "}
                  <Link to="/contact" className="text-primary-600 font-bold hover:underline">contactez le support</Link>.
                </p>
              </div>
            </Section>

          </main>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDocs;
