// pages/developers/DeveloperRegister.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Key, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { getApiUrl } from "../../config";

const DeveloperRegister = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({ name: "", email: "", company: "", useCase: "", password: "", plan: "starter" });
	const [showPass, setShowPass] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const PLANS = [
		{ id: "starter", label: "Starter — Gratuit", desc: "50 txns/mois" },
		{ id: "growth", label: "Growth — 49€/mois", desc: "1 000 txns/mois" },
		{ id: "pro", label: "Pro — 149€/mois", desc: "10 000 txns/mois" },
	];

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const res = await fetch(`${getApiUrl()}/developer/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription");
			setSuccess(true);
			setTimeout(() => navigate("/dashboard"), 2000);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
				<div className="text-center">
					<div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
						<CheckCircle className="w-10 h-10 text-primary-400" />
					</div>
					<h2 className="text-3xl font-black text-white mb-3">Compte créé !</h2>
					<p className="text-slate-400 font-medium">Redirection vers votre dashboard…</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-16">
			<div className="w-full max-w-lg">
				{/* Header */}
				<div className="text-center mb-10">
					<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs font-black uppercase tracking-widest mb-6">
						<Key className="w-3.5 h-3.5" /> Portail Développeur
					</div>
					<h1 className="text-3xl md:text-4xl font-black text-white mb-3">Créer votre compte</h1>
					<p className="text-slate-400 font-medium">Votre clé API sera générée instantanément</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 space-y-5 backdrop-blur-sm">
					{error && (
						<div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
							{error}
						</div>
					)}

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
						<div>
							<label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Nom complet *</label>
							<input
								required value={form.name}
								onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
								className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-sm font-medium"
								placeholder="Mamadou Diallo"
							/>
						</div>
						<div>
							<label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Entreprise</label>
							<input
								value={form.company}
								onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
								className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-sm font-medium"
								placeholder="FinTech Dakar (optionnel)"
							/>
						</div>
					</div>

					<div>
						<label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Email *</label>
						<input
							required type="email" value={form.email}
							onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
							className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-sm font-medium"
							placeholder="dev@monapp.com"
						/>
					</div>

					<div className="relative">
						<label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Mot de passe *</label>
						<input
							required type={showPass ? "text" : "password"} value={form.password}
							onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
							minLength={8}
							className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-sm font-medium pr-12"
							placeholder="8 caractères minimum"
						/>
						<button type="button" onClick={() => setShowPass(p => !p)}
							className="absolute right-4 top-[38px] text-slate-500 hover:text-slate-300 transition-colors">
							{showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
						</button>
					</div>

					<div>
						<label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Cas d'usage</label>
						<textarea
							value={form.useCase}
							onChange={e => setForm(f => ({ ...f, useCase: e.target.value }))}
							rows={2}
							className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-sm font-medium resize-none"
							placeholder="Ex: App mobile de transfert pour étudiants sénégalais…"
						/>
					</div>

					<div>
						<label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Plan *</label>
						<div className="space-y-2">
							{PLANS.map(p => (
								<label key={p.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${form.plan === p.id ? "border-primary-500 bg-primary-500/10" : "border-slate-700 hover:border-slate-600"}`}>
									<input type="radio" name="plan" value={p.id} checked={form.plan === p.id}
										onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
										className="accent-primary-500 w-4 h-4" />
									<div>
										<p className="text-sm font-black text-white">{p.label}</p>
										<p className="text-xs text-slate-400 font-medium">{p.desc}</p>
									</div>
								</label>
							))}
						</div>
					</div>

					<button type="submit" disabled={loading}
						className="w-full py-4 bg-primary-500 hover:bg-primary-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all hover:-translate-y-0.5 shadow-xl shadow-primary-500/25 flex items-center justify-center gap-3 text-lg mt-2">
						{loading ? (
							<span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						) : (
							<><Key className="w-5 h-5" /> Créer mon compte & ma clé API <ArrowRight className="w-5 h-5" /></>
						)}
					</button>

					<p className="text-center text-xs text-slate-500 font-medium">
						Déjà un compte ?{" "}
						<Link to="/login" className="text-primary-400 hover:text-primary-300 font-bold">Se connecter</Link>
					</p>
				</form>

				<p className="text-center text-xs text-slate-600 font-medium mt-6">
					En créant un compte, vous acceptez nos{" "}
					<Link to="/terms" className="underline hover:text-slate-400">CGU</Link> et notre{" "}
					<Link to="/privacy" className="underline hover:text-slate-400">politique de confidentialité</Link>.
				</p>
			</div>
		</div>
	);
};

export default DeveloperRegister;
