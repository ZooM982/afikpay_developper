// pages/developers/DevelopersLanding.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
	Code2, Zap, Shield, Globe, ArrowRight, CheckCircle,
	Terminal, Key, BarChart3, Webhook, BookOpen, ChevronRight,
} from "lucide-react";

const PLANS = []; // Moved to DeveloperPricing.jsx

const FEATURES = [
	{ icon: <Zap className="w-6 h-6" />, title: "Intégration en 5 min", desc: "Une clé API, quelques requêtes HTTP. Aucune configuration complexe.", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
	{ icon: <Shield className="w-6 h-6" />, title: "Sécurité maximale", desc: "Clés hashées SHA-256, HTTPS obligatoire, rate limiting par clé.", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
	{ icon: <Globe className="w-6 h-6" />, title: "8 pays couverts", desc: "Sénégal, Congo, Côte d'Ivoire, Togo, Cameroun, Bénin, Mali, Guinée.", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
	{ icon: <Webhook className="w-6 h-6" />, title: "Webhooks temps réel", desc: "Recevez les événements de transaction dès qu'ils se produisent.", color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20" },
	{ icon: <BarChart3 className="w-6 h-6" />, title: "Analytics détaillés", desc: "Dashboard de consommation, logs, taux de succès, latence.", color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20" },
	{ icon: <Terminal className="w-6 h-6" />, title: "Sandbox inclus", desc: "Environnement de test complet sans dépenses réelles.", color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20" },
];

const ENDPOINTS = [
	{ method: "POST", path: "/v1/transfer", desc: "Initier un transfert", color: "bg-emerald-500" },
	{ method: "GET", path: "/v1/transfer/:id", desc: "Statut d'une transaction", color: "bg-blue-500" },
	{ method: "GET", path: "/v1/countries", desc: "Pays & opérateurs disponibles", color: "bg-blue-500" },
	{ method: "GET", path: "/v1/rates", desc: "Taux de change en temps réel", color: "bg-blue-500" },
	{ method: "POST", path: "/v1/webhook/verify", desc: "Vérifier un webhook entrant", color: "bg-violet-500" },
];

const CODE_SAMPLE = `const res = await fetch('https://api.afrikpay.tech/v1/transfer', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_live_YOUR_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 50000,        // en XOF
    currency: 'XOF',
    recipientPhone: '+221771234567',
    country: 'SN',
    operator: 'wave'
  })
});
// { transactionId: 'TXN_abc123', status: 'pending' }`;

const DevelopersLanding = () => {
	const [copied, setCopied] = React.useState(false);

	const copy = () => {
		navigator.clipboard.writeText(CODE_SAMPLE);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-secondary-950 font-sans">

			{/* ── Hero ── */}
			<section className="relative overflow-hidden pt-32 pb-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
				<div className="absolute inset-0 opacity-[0.07] pointer-events-none"
					style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary-600/15 rounded-full blur-[120px] pointer-events-none" />

				<div className="container mx-auto px-4 max-w-6xl relative z-10">
					<div className="flex flex-col lg:flex-row items-center gap-14">

						{/* Text */}
						<div className="lg:w-1/2 text-center lg:text-left">
							<h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6">
								L'API de transfert<br />
								<span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
									vers l'Afrique
								</span>
							</h1>
							<p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
								Intégrez Wave, Orange Money, MTN Mobile Money et plus encore
								en quelques lignes de code. Couvrant 8 pays d'Afrique.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
								<Link to="/register"
									className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-400 text-white font-black rounded-2xl transition-all hover:-translate-y-0.5 shadow-xl shadow-primary-500/25">
									<Key className="w-5 h-5" /> Obtenir une clé API <ArrowRight className="w-5 h-5" />
								</Link>
								<Link to="/docs"
									className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-all">
									<BookOpen className="w-5 h-5" /> Documentation
								</Link>
							</div>
							<div className="flex flex-wrap gap-10 mt-12 justify-center lg:justify-start">
								{[{ v: "99.9%", l: "Uptime" }, { v: "<200ms", l: "Latence" }, { v: "8 pays", l: "Couverts" }].map(s => (
									<div key={s.l}>
										<p className="text-2xl font-black text-white">{s.v}</p>
										<p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{s.l}</p>
									</div>
								))}
							</div>
						</div>

						{/* Code block */}
						<div className="lg:w-1/2 w-full">
							<div className="rounded-2xl bg-slate-950 border border-slate-700/50 overflow-hidden shadow-2xl">
								<div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700/50">
									<div className="flex gap-1.5">
										{["bg-red-500","bg-yellow-500","bg-green-500"].map(c=>(
											<span key={c} className={`w-3 h-3 rounded-full ${c}`} />
										))}
									</div>
									<span className="text-slate-400 text-xs font-mono">transfer.js</span>
									<button onClick={copy} className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-700">
										{copied ? "✓ Copié" : "Copier"}
									</button>
								</div>
								<pre className="p-5 text-xs md:text-sm font-mono text-slate-300 overflow-x-auto leading-6">
									<code>{CODE_SAMPLE}</code>
								</pre>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── Features ── */}
			<section className="py-24 bg-white dark:bg-secondary-950 border-b border-slate-100 dark:border-secondary-900">
				<div className="container mx-auto px-4 max-w-6xl">
					<div className="text-center mb-16">
						<span className="text-primary-600 font-black uppercase tracking-[0.3em] text-xs mb-3 block">Pourquoi AfriKPay API ?</span>
						<h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
							Tout ce dont vous avez besoin, <span className="text-gradient">prêt à l'emploi</span>
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{FEATURES.map((f, i) => (
							<div key={i} className="group p-8 rounded-3xl bg-slate-50 dark:bg-secondary-900/50 border border-slate-100 dark:border-secondary-800 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
								<div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>{f.icon}</div>
								<h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{f.title}</h3>
								<p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed font-medium">{f.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>



			{/* ── Endpoints ── */}
			<section className="py-24 bg-white dark:bg-secondary-950 border-b border-slate-100 dark:border-secondary-900">
				<div className="container mx-auto px-4 max-w-6xl">
					<div className="flex flex-col lg:flex-row items-center gap-16">
						<div className="lg:w-1/2">
							<span className="text-primary-600 font-black uppercase tracking-[0.3em] text-xs mb-4 block">Endpoints principaux</span>
							<h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
								Une API claire et <span className="text-gradient">bien documentée</span>
							</h2>
							<p className="text-slate-500 dark:text-gray-400 mb-8 leading-relaxed font-medium">
								Exemples en JavaScript, Python et cURL. Console interactive disponible dans le dashboard.
							</p>
							<Link to="/docs" className="inline-flex items-center gap-2 text-primary-600 font-black hover:gap-3 transition-all">
								Voir la documentation <ChevronRight className="w-5 h-5" />
							</Link>
						</div>
						<div className="lg:w-1/2 w-full space-y-3">
							{ENDPOINTS.map((ep, i) => (
								<div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-secondary-900/60 border border-slate-100 dark:border-secondary-800 hover:border-primary-200 dark:hover:border-primary-900/50 transition-colors group">
									<span className={`${ep.color} text-white text-[10px] font-black px-2.5 py-1 rounded-lg shrink-0 font-mono`}>{ep.method}</span>
									<code className="text-sm font-mono text-slate-700 dark:text-gray-300 flex-1">{ep.path}</code>
									<span className="text-xs text-slate-400 hidden sm:block">{ep.desc}</span>
									<ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors shrink-0" />
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ── CTA ── */}
			<section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
				<div className="absolute inset-0 opacity-[0.04] pointer-events-none"
					style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
				<div className="container mx-auto px-4 max-w-3xl text-center relative z-10">
					<h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Prêt à intégrer l'API ?</h2>
					<p className="text-slate-300 text-lg mb-10 font-medium">Créez votre compte développeur gratuitement. Votre première clé API est disponible immédiatement.</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link to="/register"
							className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-primary-500 hover:bg-primary-400 text-white font-black rounded-2xl transition-all hover:-translate-y-0.5 shadow-xl shadow-primary-500/30 text-lg">
							<Key className="w-5 h-5" /> Créer mon compte gratuit
						</Link>
						<Link to="/contact"
							className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-all">
							Parler à l'équipe
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export default DevelopersLanding;
