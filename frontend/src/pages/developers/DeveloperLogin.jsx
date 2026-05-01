// pages/developers/DeveloperLogin.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Key, ArrowRight, Eye, EyeOff } from "lucide-react";
import { getApiUrl } from "../../config";

const DeveloperLogin = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: "", password: "" });
	const [showPass, setShowPass] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const res = await fetch(`${getApiUrl()}/developer/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Email ou mot de passe incorrect");
			localStorage.setItem("devToken", data.token);
			navigate("/dashboard");
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-16">
			<div className="w-full max-w-md">
				<div className="text-center mb-10">
					<h1 className="text-3xl font-black text-white mb-3">Connexion</h1>
					<p className="text-slate-400 font-medium">Accédez à vos clés API et statistiques</p>
				</div>

				<form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 space-y-5 backdrop-blur-sm">
					{error && (
						<div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
							{error}
						</div>
					)}

					<div>
						<label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Email</label>
						<input
							required type="email" value={form.email}
							onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
							className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-sm font-medium"
							placeholder="dev@monapp.com"
						/>
					</div>

					<div className="relative">
						<label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Mot de passe</label>
						<input
							required type={showPass ? "text" : "password"} value={form.password}
							onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
							className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-sm font-medium pr-12"
							placeholder="••••••••"
						/>
						<button type="button" onClick={() => setShowPass(p => !p)}
							className="absolute right-4 top-[38px] text-slate-500 hover:text-slate-300 transition-colors">
							{showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
						</button>
					</div>

					<button type="submit" disabled={loading}
						className="w-full py-4 bg-primary-500 hover:bg-primary-400 disabled:opacity-60 text-white font-black rounded-2xl transition-all hover:-translate-y-0.5 shadow-xl shadow-primary-500/25 flex items-center justify-center gap-3 text-lg mt-2">
						{loading
							? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							: <><Key className="w-5 h-5" /> Se connecter <ArrowRight className="w-5 h-5" /></>
						}
					</button>

					<p className="text-center text-xs text-slate-500 font-medium">
						Pas encore de compte ?{" "}
						<Link to="/register" className="text-primary-400 hover:text-primary-300 font-bold">Créer un compte gratuit</Link>
					</p>
				</form>
			</div>
		</div>
	);
};

export default DeveloperLogin;
