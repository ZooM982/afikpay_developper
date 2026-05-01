// pages/developers/DeveloperDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
	Key, Copy, Eye, EyeOff, RefreshCw, Trash2, Plus,
	BarChart3, Activity, AlertTriangle, CheckCircle,
	LogOut, BookOpen, ExternalLink, Zap, Clock, Shield
} from "lucide-react";
import { getApiUrl } from "../../config";

const API = getApiUrl();

const PLAN_COLORS = {
	starter: "bg-slate-100 text-slate-700 dark:bg-secondary-800 dark:text-gray-300",
	growth: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400",
	pro: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
	enterprise: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

// ── Mini chart ──────────────────────────────────────────────────────────────
const UsageChart = ({ daily = [] }) => {
	if (!daily.length) return (
		<div className="h-24 flex items-center justify-center text-slate-400 text-sm font-medium">Aucune donnée disponible</div>
	);
	const max = Math.max(...daily.map(d => d.calls), 1);
	return (
		<div className="flex items-end gap-1 h-24">
			{daily.slice(-30).map((d, i) => (
				<div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
					<div
						className="w-full bg-primary-500/20 dark:bg-primary-500/30 rounded-t-sm group-hover:bg-primary-500 transition-colors"
						style={{ height: `${(d.calls / max) * 100}%`, minHeight: d.calls > 0 ? "4px" : "0" }}
					/>
					<div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10">
						{d._id}: {d.calls} appels
					</div>
				</div>
			))}
		</div>
	);
};

// ── Withdraw Modal ────────────────────────────────────────────────────────
const WithdrawModal = ({ isOpen, onClose, balance, onWithdraw }) => {
	const [amount, setAmount] = useState("");
	const [phone, setPhone] = useState("");
	const [operator, setOperator] = useState("wave");
	const [loading, setLoading] = useState(false);

	if (!isOpen) return null;

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		await onWithdraw({ amount: Number(amount), phone, operator });
		setLoading(false);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
			<div className="bg-white dark:bg-secondary-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-secondary-800 animate-scale-in">
				<h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Retrait de fonds</h2>
				<p className="text-sm text-slate-400 font-medium mb-6">Solde disponible : <span className="text-emerald-500 font-bold">{balance?.toLocaleString()} XOF</span></p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Montant à retirer (XOF)</label>
						<input type="number" required value={amount} onChange={e => setAmount(e.target.value)}
							max={balance} min="100"
							placeholder="Ex: 5000"
							className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-secondary-800 border border-slate-200 dark:border-secondary-700 text-slate-900 dark:text-white text-sm font-bold focus:border-primary-500 outline-none" />
					</div>
					<div>
						<label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Numéro Mobile Money</label>
						<input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
							placeholder="Ex: 770000000"
							className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-secondary-800 border border-slate-200 dark:border-secondary-700 text-slate-900 dark:text-white text-sm font-bold focus:border-primary-500 outline-none" />
					</div>
					<div>
						<label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Opérateur</label>
						<select value={operator} onChange={e => setOperator(e.target.value)}
							className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-secondary-800 border border-slate-200 dark:border-secondary-700 text-slate-900 dark:text-white text-sm font-bold focus:border-primary-500 outline-none">
							<option value="wave">Wave</option>
							<option value="orange">Orange Money</option>
							<option value="free">Free Money</option>
							<option value="e-money">E-Money</option>
						</select>
					</div>
					<div className="flex gap-3 pt-4">
						<button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors">Annuler</button>
						<button type="submit" disabled={loading || !amount || amount > balance}
							className="flex-[2] py-4 bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-primary-500/20">
							{loading ? "Traitement..." : "Confirmer le retrait"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

// ── Main ────────────────────────────────────────────────────────────────────
const DeveloperDashboard = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [devToken] = useState(() => localStorage.getItem("devToken"));
	const [keys, setKeys] = useState([]);
	const [stats, setStats] = useState(null);
	const [logs, setLogs] = useState([]);
	const [apiTransactions, setApiTransactions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showKey, setShowKey] = useState({});
	const [copied, setCopied] = useState("");
	const [creating, setCreating] = useState(false);
	const [newLabel, setNewLabel] = useState("");
	const [newEnv, setNewEnv] = useState("live");
	const [justCreated, setJustCreated] = useState(null);
	const [activeTab, setActiveTab] = useState("keys");

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const tab = params.get("tab");
		if (tab) setActiveTab(tab);
		else setActiveTab("keys");
	}, [location]);
	const [showWithdrawModal, setShowWithdrawModal] = useState(false);
	const [availableCountries, setAvailableCountries] = useState([]);
	const [requestingCountries, setRequestingCountries] = useState(false);
	const [webhookUrl, setWebhookUrl] = useState("");
	const [webhookSecret, setWebhookSecret] = useState("");
	const [updatingWebhook, setUpdatingWebhook] = useState(false);

	const headers = { Authorization: `Bearer ${devToken}`, "Content-Type": "application/json" };

	const fetchAll = useCallback(async () => {
		if (!devToken) { navigate("/login"); return; }
		setLoading(true);
		try {
			const [keysRes, statsRes, logsRes, txRes, countriesRes] = await Promise.all([
				fetch(`${API}/developer/keys`, { headers }),
				fetch(`${API}/developer/stats`, { headers }),
				fetch(`${API}/developer/logs?limit=20`, { headers }),
				fetch(`${API}/developer/transactions`, { headers }),
				fetch(`${API}/developer/countries`, { headers }),
			]);
			if (keysRes.status === 401) { localStorage.removeItem("devToken"); navigate("/login"); return; }
			const [keysData, statsData, logsData, txData, countriesData] = await Promise.all([
				keysRes.json(), 
				statsRes.json(), 
				logsRes.json(),
				txRes.json(),
				countriesRes.json(),
			]);
			setKeys(keysData.keys || []);
			setStats(statsData);
			setLogs(logsData.logs || []);
			setApiTransactions(txData.transactions || []);
			setAvailableCountries(countriesData.countries || []);
			setWebhookUrl(statsData.webhookUrl || "");
			setWebhookSecret(statsData.webhookSecret || "••••••••••••••••");
		} catch (e) { console.error(e); }
		finally { setLoading(false); }
	}, [devToken, navigate]);

	useEffect(() => { fetchAll(); }, [fetchAll]);

	const copyKey = (val, id) => {
		navigator.clipboard.writeText(val);
		setCopied(id);
		setTimeout(() => setCopied(""), 2000);
	};

	const createKey = async () => {
		setCreating(true);
		try {
			const res = await fetch(`${API}/developer/keys`, {
				method: "POST",
				headers,
				body: JSON.stringify({ label: newLabel || undefined, environment: newEnv }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			setJustCreated(data.rawKey);
			setNewLabel("");
			fetchAll();
		} catch (e) { alert(e.message); }
		finally { setCreating(false); }
	};

	const revokeKey = async (keyId) => {
		if (!window.confirm("Révoquer cette clé ? Les applications qui l'utilisent perdront l'accès.")) return;
		await fetch(`${API}/developer/keys/${keyId}`, { method: "DELETE", headers });
		fetchAll();
	};

	const logout = () => { localStorage.removeItem("devToken"); navigate("/login"); };

	const handleWithdraw = async (withdrawalData) => {
		try {
			const res = await fetch(`${API}/developer/withdraw`, {
				method: "POST",
				headers,
				body: JSON.stringify(withdrawalData),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			alert(data.message);
			fetchAll(); // Rafraîchir le solde
		} catch (e) {
			alert(e.message);
		}
	};

	const handleCountryRequest = async (countryCode) => {
		setRequestingCountries(true);
		try {
			const res = await fetch(`${API}/developer/countries/request`, {
				method: "POST",
				headers,
				body: JSON.stringify({ countryCodes: [countryCode] }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			alert(data.message);
			fetchAll();
		} catch (e) {
			alert(e.message);
		} finally {
			setRequestingCountries(false);
		}
	};

	const handleWebhookUpdate = async () => {
		setUpdatingWebhook(true);
		try {
			const res = await fetch(`${API}/developer/webhook`, {
				method: "POST",
				headers,
				body: JSON.stringify({ webhookUrl }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			alert(data.message);
		} catch (e) {
			alert(e.message);
		} finally {
			setUpdatingWebhook(false);
		}
	};

	const pct = (used, quota) => Math.min(100, Math.round((used / quota) * 100));

	return (
		<DashboardLayout type="client" userEmail={stats?.email || ""}>
			<div className="space-y-8">
				{/* ── Alert clé créée ── */}
				{justCreated && (
					<div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600">
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

				{/* ── Balance & Stats ── */}
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Balance Card */}
					<div className="lg:col-span-1 p-6 rounded-3xl bg-gradient-premium text-white shadow-2xl shadow-blue-900/20 flex flex-col justify-between relative overflow-hidden group">
						<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
						<div className="relative z-10">
							<p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-1">Solde disponible</p>
							<h3 className="text-3xl font-black">{stats?.balance?.toLocaleString() ?? "0"} <span className="text-sm font-medium">XOF</span></h3>
						</div>
						<button onClick={() => setShowWithdrawModal(true)} 
							className="relative z-10 mt-6 w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95">
							Demander un retrait
						</button>
					</div>

					<div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-4">
						{[
							{ label: "Appels ce mois", value: stats?.summary?.totalCalls ?? 0, icon: <Activity className="w-5 h-5" />, color: "text-primary-600" },
							{ label: "Taux de succès", value: stats?.summary?.totalCalls ? `${Math.round(((stats.summary.totalCalls - (stats.summary.totalErrors || 0)) / stats.summary.totalCalls) * 100)}%` : "—", icon: <CheckCircle className="w-5 h-5" />, color: "text-emerald-600" },
							{ label: "Latence moy.", value: stats?.summary?.avgResponseMs ? `${Math.round(stats.summary.avgResponseMs)}ms` : "—", icon: <Clock className="w-5 h-5" />, color: "text-blue-600" },
						].map((s, i) => (
							<div key={i} className="p-5 rounded-2xl bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800">
								<div className={`${s.color} mb-3`}>{s.icon}</div>
								<p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
								<p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{s.label}</p>
							</div>
						))}
					</div>
				</div>

				{/* ── Usage chart ── */}
				<div className="p-6 rounded-2xl bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800">
					<div className="flex items-center justify-between mb-6">
						<div>
							<p className="font-black text-slate-900 dark:text-white">Consommation — 30 derniers jours</p>
							<p className="text-xs text-slate-400 font-bold mt-0.5">Nombre d'appels API par jour</p>
						</div>
						<button onClick={fetchAll} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-secondary-800 transition-colors">
							<RefreshCw className="w-4 h-4 text-slate-400" />
						</button>
					</div>
					<UsageChart daily={stats?.daily || []} />
				</div>



				{/* ── Keys tab ── */}
				{activeTab === "keys" && (
					<div className="space-y-4">
						{/* Create key form */}
						<div className="p-6 rounded-2xl bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800">
							<p className="font-black text-slate-900 dark:text-white mb-4">Créer une nouvelle clé</p>
							<div className="flex flex-col sm:flex-row gap-3">
								<input value={newLabel} onChange={e => setNewLabel(e.target.value)}
									placeholder="Label (ex: Mon app mobile)"
									className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-secondary-800 border border-slate-200 dark:border-secondary-700 text-slate-900 dark:text-white text-sm font-medium focus:border-primary-500 focus:outline-none" />
								<select value={newEnv} onChange={e => setNewEnv(e.target.value)}
									className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-secondary-800 border border-slate-200 dark:border-secondary-700 text-slate-900 dark:text-white text-sm font-medium focus:border-primary-500 focus:outline-none">
									<option value="live">Production (live)</option>
									<option value="test">Sandbox (test)</option>
								</select>
								<button onClick={createKey} disabled={creating}
									className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-400 disabled:opacity-60 text-white font-black rounded-xl transition-all text-sm">
									{creating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
									Créer
								</button>
							</div>
						</div>

						{/* Keys list */}
						{keys.length === 0 ? (
							<div className="p-12 rounded-2xl bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800 text-center">
								<Key className="w-10 h-10 text-slate-300 dark:text-secondary-600 mx-auto mb-3" />
								<p className="text-slate-500 dark:text-gray-400 font-medium">Aucune clé API. Créez-en une ci-dessus.</p>
							</div>
						) : keys.map(k => (
							<div key={k._id} className="p-6 rounded-2xl bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800">
								<div className="flex flex-wrap items-start justify-between gap-4 mb-4">
									<div>
										<div className="flex items-center gap-2 flex-wrap">
											<p className="font-black text-slate-900 dark:text-white">{k.label}</p>
											<span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${PLAN_COLORS[k.plan]}`}>{k.plan}</span>
											<span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${k.environment === "live" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
												{k.environment}
											</span>
											{k.status === "revoked" && <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">révoquée</span>}
										</div>
										<p className="text-xs text-slate-400 font-medium mt-1">
											Créée le {new Date(k.createdAt).toLocaleDateString("fr-FR")}
											{k.lastUsedAt && ` · Utilisée le ${new Date(k.lastUsedAt).toLocaleDateString("fr-FR")}`}
										</p>
									</div>
									{k.status === "active" && (
										<button onClick={() => revokeKey(k._id)} className="text-xs text-red-400 hover:text-red-600 font-black flex items-center gap-1 transition-colors">
											<Trash2 className="w-3.5 h-3.5" /> Révoquer
										</button>
									)}
								</div>

								{/* Key display */}
								<div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-secondary-800 border border-slate-100 dark:border-secondary-700 mb-4">
									<code className="flex-1 text-sm font-mono text-slate-700 dark:text-gray-300 truncate">
										{showKey[k._id] ? k.keyPrefix + "••••••••••••••••••••" : k.keyPrefix + "••••••••••••••••••••"}
									</code>
									<button onClick={() => copyKey(k.keyPrefix, k._id)}
										className="shrink-0 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-secondary-700 transition-colors">
										{copied === k._id ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
									</button>
								</div>

								{/* Quota bar */}
								<div>
									<div className="flex justify-between text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5">
										<span>{k.usedThisMonth} / {k.quotaMonthly === 999999999 ? "∞" : k.quotaMonthly.toLocaleString()} appels ce mois</span>
										<span>{k.quotaMonthly !== 999999999 ? `${pct(k.usedThisMonth, k.quotaMonthly)}%` : ""}</span>
									</div>
									{k.quotaMonthly !== 999999999 && (
										<div className="h-2 bg-slate-100 dark:bg-secondary-800 rounded-full overflow-hidden">
											<div className={`h-full rounded-full transition-all ${pct(k.usedThisMonth, k.quotaMonthly) > 85 ? "bg-red-500" : "bg-primary-500"}`}
												style={{ width: `${pct(k.usedThisMonth, k.quotaMonthly)}%` }} />
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				)}

				{/* ── Countries tab ── */}
				{activeTab === "countries" && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{availableCountries.map((c) => (
							<div key={c.code} className="p-6 rounded-2xl bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800 flex flex-col justify-between hover:shadow-xl transition-all group">
								<div>
									<div className="flex justify-between items-start mb-4">
										<span className="text-4xl">{c.flag}</span>
										<span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${
											c.status === 'authorized' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
											c.status === 'pending' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
											c.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
											'bg-slate-100 text-slate-500 dark:bg-secondary-800 dark:text-gray-400'
										}`}>
											{c.status === 'not_requested' ? 'Non demandé' : 
											 c.status === 'authorized' ? 'Autorisé' : 
											 c.status === 'pending' ? 'En attente' : 'Refusé'}
										</span>
									</div>
									<h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{c.name}</h3>
									<p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{c.code}</p>
								</div>

								<div className="mt-6">
									{c.status === 'authorized' ? (
										<div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
											<CheckCircle className="w-5 h-5" />
											Service actif
										</div>
									) : c.status === 'pending' ? (
										<div className="flex items-center gap-2 text-blue-500 text-sm font-bold">
											<Clock className="w-5 h-5" />
											Demande en cours...
										</div>
									) : (
										<button 
											disabled={requestingCountries}
											onClick={() => handleCountryRequest(c.code)}
											className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-sm font-black rounded-xl hover:opacity-80 transition-all active:scale-95 disabled:opacity-50"
										>
											Demander l'activation
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				)}

				{/* ── Transactions tab ── */}
				{activeTab === "tx" && (
					<div className="rounded-2xl bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800 overflow-hidden">
						<div className="p-5 border-b border-slate-100 dark:border-secondary-800 flex items-center justify-between">
							<p className="font-black text-slate-900 dark:text-white">Historique des transferts API</p>
							<button onClick={fetchAll} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-secondary-800 transition-colors">
								<RefreshCw className="w-4 h-4 text-slate-400" />
							</button>
						</div>
						{apiTransactions.length === 0 ? (
							<div className="p-12 text-center text-slate-400 font-medium">Aucun transfert effectué via l'API</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead className="bg-slate-50 dark:bg-secondary-800/50">
										<tr>
											{["Destinataire", "Montant", "Net Client", "Statut", "Date"].map(h => (
												<th key={h} className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">{h}</th>
											))}
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100 dark:divide-secondary-800">
										{apiTransactions.map((tx, i) => (
											<tr key={i} className="hover:bg-slate-50 dark:hover:bg-secondary-800/30 transition-colors">
												<td className="px-4 py-3">
													<p className="font-bold text-slate-900 dark:text-white text-xs">{tx.recipientPhone}</p>
													<p className="text-[10px] text-slate-400">{tx.operator.toUpperCase()}</p>
												</td>
												<td className="px-4 py-3 font-black text-slate-900 dark:text-white text-xs">{tx.amount} {tx.currency}</td>
												<td className="px-4 py-3 font-black text-emerald-600 text-xs">{tx.netAmount} {tx.currency}</td>
												<td className="px-4 py-3">
													<span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${tx.status === "completed" || tx.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
														{tx.status}
													</span>
												</td>
												<td className="px-4 py-3 text-[10px] text-slate-400 font-medium whitespace-nowrap">
													{new Date(tx.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}
				{activeTab === "logs" && (
					<div className="rounded-2xl bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800 overflow-hidden">
						<div className="p-5 border-b border-slate-100 dark:border-secondary-800 flex items-center justify-between">
							<p className="font-black text-slate-900 dark:text-white">20 derniers appels</p>
							<button onClick={fetchAll} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-secondary-800 transition-colors">
								<RefreshCw className="w-4 h-4 text-slate-400" />
							</button>
						</div>
						{logs.length === 0 ? (
							<div className="p-12 text-center text-slate-400 font-medium">Aucun log disponible</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead className="bg-slate-50 dark:bg-secondary-800/50">
										<tr>
											{["Endpoint", "Méthode", "Statut", "Latence", "Date"].map(h => (
												<th key={h} className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">{h}</th>
											))}
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100 dark:divide-secondary-800">
										{logs.map((log, i) => (
											<tr key={i} className="hover:bg-slate-50 dark:hover:bg-secondary-800/30 transition-colors">
												<td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-gray-300 max-w-[200px] truncate">{log.endpoint}</td>
												<td className="px-4 py-3">
													<span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${log.method === "POST" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
														{log.method}
													</span>
												</td>
												<td className="px-4 py-3">
													<span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${log.statusCode < 300 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : log.statusCode < 500 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
														{log.statusCode}
													</span>
												</td>
												<td className="px-4 py-3 text-xs text-slate-500 dark:text-gray-400 font-medium">{log.responseTimeMs ? `${log.responseTimeMs}ms` : "—"}</td>
												<td className="px-4 py-3 text-xs text-slate-400 font-medium whitespace-nowrap">
													{new Date(log.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}

				{/* ── Webhooks tab ── */}
				{activeTab === "webhooks" && (
					<div className="space-y-6">
						<div className="p-6 rounded-2xl bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800">
							<div className="flex items-center gap-3 mb-6">
								<div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-xl flex items-center justify-center">
									<Zap className="w-5 h-5" />
								</div>
								<div>
									<p className="font-black text-slate-900 dark:text-white">Configuration Webhook</p>
									<p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Recevez des notifications en temps réel</p>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Endpoint URL</label>
									<div className="flex flex-col sm:flex-row gap-3">
										<input 
											value={webhookUrl} 
											onChange={e => setWebhookUrl(e.target.value)}
											placeholder="https://votre-site.com/api/webhook"
											className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-secondary-800 border border-slate-200 dark:border-secondary-700 text-slate-900 dark:text-white text-sm font-medium focus:border-primary-500 focus:outline-none"
										/>
										<button 
											onClick={handleWebhookUpdate}
											disabled={updatingWebhook}
											className="px-6 py-3 bg-primary-500 hover:bg-primary-400 text-white font-black rounded-xl transition-all text-sm disabled:opacity-50"
										>
											{updatingWebhook ? "Mise à jour..." : "Enregistrer"}
										</button>
									</div>
								</div>

								<div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
									<div className="flex items-start gap-3">
										<Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
										<div>
											<p className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">Secret Webhook</p>
											<p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-3">Utilisez ce secret pour vérifier la signature `X-AfriKPay-Signature` de chaque requête.</p>
											<div className="flex items-center gap-2">
												<code className="flex-1 px-3 py-2 bg-white/50 dark:bg-black/20 text-amber-900 dark:text-amber-200 rounded-lg text-[10px] font-mono break-all border border-amber-200/50 dark:border-amber-800/30">
													{webhookSecret}
												</code>
												<button onClick={() => copyKey(webhookSecret, "webhook")} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
													{copied === "webhook" ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-amber-600" />}
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="p-6 rounded-2xl bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800">
							<p className="font-black text-slate-900 dark:text-white mb-4">Événements disponibles</p>
							<div className="space-y-2">
								{[
									{ event: "transfer.created", desc: "Déclenché dès qu'une transaction est initiée via l'API." },
									{ event: "transfer.completed", desc: "Déclenché quand le transfert est réussi (bientôt disponible)." },
									{ event: "transfer.failed", desc: "Déclenché en cas d'échec du transfert (bientôt disponible)." }
								].map(ev => (
									<div key={ev.event} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-secondary-800/50 transition-colors">
										<code className="text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded font-mono shrink-0">{ev.event}</code>
										<span className="text-xs text-slate-500 dark:text-gray-400 font-medium">{ev.desc}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</div>

			<WithdrawModal 
				isOpen={showWithdrawModal} 
				onClose={() => setShowWithdrawModal(false)} 
				balance={stats?.balance || 0}
				onWithdraw={handleWithdraw}
			/>
		</DashboardLayout>
	);
};

export default DeveloperDashboard;
