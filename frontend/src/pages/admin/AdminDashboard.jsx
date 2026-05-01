import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getApiUrl } from "../../config";
import DashboardLayout from "../../components/DashboardLayout";
import { Users, ShieldCheck, CreditCard, Search, ChevronRight, CheckCircle, XCircle } from "lucide-react";

const AdminDashboard = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [developers, setDevelopers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [activeTab, setActiveTab] = useState("devs");
	const [searchTerm, setSearchTerm] = useState("");
	const token = localStorage.getItem("adminToken");

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const tab = params.get("tab");
		if (tab) setActiveTab(tab);
		else setActiveTab("devs");
	}, [location]);

	useEffect(() => {
		if (!token) {
			navigate("/admin/login");
			return;
		}
		fetchDevelopers();
	}, [token]);

	const fetchDevelopers = async () => {
		try {
			const res = await fetch(`${getApiUrl()}/admin/developers`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to fetch developers");
			setDevelopers(data.developers);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateStatus = async (devId, countryCode, status) => {
		try {
			const res = await fetch(`${getApiUrl()}/admin/developers/${devId}/countries`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ countryCode, status }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Update failed");
			fetchDevelopers();
		} catch (err) {
			alert(err.message);
		}
	};

	const filteredDevs = developers.filter(d => 
		d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
		d.email.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const pendingApprovals = developers.flatMap(d => 
		(d.countryAccess || [])
			.filter(a => a.status === 'pending')
			.map(a => ({ ...a, devName: d.name, devId: d._id }))
	);

	return (
		<DashboardLayout type="admin" userEmail="admin@afrikpay.tech">
			<div className="space-y-8">
				{/* Stats Row */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{[
						{ label: "Total Développeurs", value: developers.length, icon: <Users className="text-blue-500" /> },
						{ label: "Approbations en attente", value: pendingApprovals.length, icon: <ShieldCheck className="text-amber-500" /> },
						{ label: "Volume Global (24h)", value: "0 XOF", icon: <CreditCard className="text-emerald-500" /> },
					].map((stat, i) => (
						<div key={i} className="bg-white dark:bg-secondary-900 p-6 rounded-3xl border border-slate-100 dark:border-secondary-800 shadow-sm">
							<div className="flex items-center justify-between mb-4">
								<div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-secondary-800 flex items-center justify-center">{stat.icon}</div>
								<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temps réel</span>
							</div>
							<p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
							<h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
						</div>
					))}
				</div>

				{/* Search & Actions */}
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
					<div className="relative w-full sm:max-w-xs">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
						<input 
							type="text" 
							placeholder="Rechercher un développeur..."
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-secondary-900 border border-slate-200 dark:border-secondary-800 text-sm font-medium focus:border-primary-500 outline-none transition-all shadow-sm"
						/>
					</div>
				</div>

				{/* Main Tab Content */}
				{activeTab === "devs" && (
					<div className="grid gap-6">
						{filteredDevs.map((dev) => (
							<div key={dev._id} className="bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
								<div className="p-6 border-b border-slate-50 dark:border-secondary-800 flex justify-between items-center">
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-secondary-800 flex items-center justify-center font-black text-slate-500">
											{dev.name.charAt(0)}
										</div>
										<div>
											<h3 className="font-black text-slate-900 dark:text-white">{dev.name}</h3>
											<p className="text-xs text-slate-500 font-medium">{dev.email} • Plan: <span className="text-primary-600 dark:text-primary-400 uppercase font-bold">{dev.plan}</span></p>
										</div>
									</div>
									<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${dev.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
										{dev.status}
									</span>
								</div>

								<div className="p-6">
									<h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Accès Pays</h4>
									{!dev.countryAccess || dev.countryAccess.length === 0 ? (
										<p className="text-sm text-slate-400 italic">Aucune demande pays.</p>
									) : (
										<div className="flex flex-wrap gap-3">
											{dev.countryAccess.map(access => (
												<div key={access.countryCode} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-secondary-800 border border-slate-100 dark:border-secondary-700">
													<span className="font-black text-slate-900 dark:text-white">{access.countryCode}</span>
													<span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
														access.status === 'authorized' ? 'text-emerald-600 bg-emerald-50' :
														access.status === 'rejected' ? 'text-red-600 bg-red-50' :
														'text-amber-600 bg-amber-50'
													}`}>
														{access.status}
													</span>
													<div className="flex gap-1 ml-2">
														<button onClick={() => handleUpdateStatus(dev._id, access.countryCode, 'authorized')} className="p-1.5 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors text-emerald-600"><CheckCircle size={14} /></button>
														<button onClick={() => handleUpdateStatus(dev._id, access.countryCode, 'rejected')} className="p-1.5 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-red-600"><XCircle size={14} /></button>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				)}

				{activeTab === "approvals" && (
					<div className="bg-white dark:bg-secondary-900 rounded-3xl border border-slate-100 dark:border-secondary-800 overflow-hidden shadow-sm">
						<table className="w-full text-left">
							<thead className="bg-slate-50 dark:bg-secondary-800/50">
								<tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-secondary-800">
									<th className="px-6 py-4">Développeur</th>
									<th className="px-6 py-4">Pays</th>
									<th className="px-6 py-4">Date</th>
									<th className="px-6 py-4 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-50 dark:divide-secondary-800">
								{pendingApprovals.map((app, i) => (
									<tr key={i} className="hover:bg-slate-50 dark:hover:bg-secondary-800/30 transition-colors">
										<td className="px-6 py-4">
											<p className="text-sm font-black text-slate-900 dark:text-white">{app.devName}</p>
										</td>
										<td className="px-6 py-4">
											<span className="text-lg font-black text-primary-500">{app.countryCode}</span>
										</td>
										<td className="px-6 py-4 text-xs text-slate-500 font-medium">
											{new Date(app.requestedAt).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex justify-end gap-2">
												<button onClick={() => handleUpdateStatus(app.devId, app.countryCode, 'authorized')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20">Autoriser</button>
												<button onClick={() => handleUpdateStatus(app.devId, app.countryCode, 'rejected')} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-black rounded-xl transition-all">Refuser</button>
											</div>
										</td>
									</tr>
								))}
								{pendingApprovals.length === 0 && (
									<tr>
										<td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium italic">Aucune demande en attente.</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}

				{(activeTab === "all-tx") && (
					<div className="text-center py-20 bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800 rounded-3xl">
						<CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
						<p className="text-slate-400 font-medium italic">Le monitoring global des transactions sera bientôt disponible.</p>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
};

export default AdminDashboard;

