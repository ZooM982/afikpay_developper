import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../../config";

const AdminLogin = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await fetch(`${getApiUrl()}/admin/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Login failed");

			localStorage.setItem("adminToken", data.token);
			localStorage.setItem("adminUser", JSON.stringify(data));
			navigate("/admin/dashboard");
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-['Inter',sans-serif]">
			<div className="max-w-md w-full bg-[#141414] border border-[#d4af37]/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
				{/* Background Glow */}
				<div className="absolute -top-24 -right-24 w-48 h-48 bg-[#d4af37] opacity-5 blur-[100px]"></div>
				<div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#d4af37] opacity-5 blur-[100px]"></div>

				<div className="relative z-10">
					<div className="flex justify-center mb-8">
						<div className="w-16 h-16 bg-gradient-to-tr from-[#d4af37] to-[#f2d06b] rounded-xl flex items-center justify-center shadow-lg shadow-[#d4af37]/20">
							<span className="text-black text-2xl font-bold">A</span>
						</div>
					</div>

					<h2 className="text-3xl font-bold text-white text-center mb-2">Admin Portal</h2>
					<p className="text-gray-400 text-center mb-8">Connectez-vous pour gérer la plateforme</p>

					{error && (
						<div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
							</svg>
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-400 mb-2">Email Administrateur</label>
							<input
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
								placeholder="admin@afrikpay.tech"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-400 mb-2">Mot de passe</label>
							<input
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
								placeholder="••••••••"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-gradient-to-r from-[#d4af37] to-[#f2d06b] text-black font-bold py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-lg shadow-[#d4af37]/20"
						>
							{loading ? (
								<span className="flex items-center justify-center gap-2">
									<svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Chargement...
								</span>
							) : (
								"Se connecter"
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default AdminLogin;
