import React, { useState, useMemo } from 'react';
import { useDashboard } from './DashboardContext';
import { Activity, CheckCircle, Clock, AlertTriangle, Copy, TrendingUp, TrendingDown } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-2xl backdrop-blur-md bg-opacity-90">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-black">{payload[0].value} <span className="text-slate-500 font-bold">appels</span></p>
      </div>
    );
  }
  return null;
};

const ActivityChart = ({ data = [] }) => {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="_id" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="calls" 
            stroke="#d4af37" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCalls)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const Overview = () => {
  const { stats, loading } = useDashboard();
  const [copied, setCopied] = useState("");

  const successRate = stats?.summary?.totalCalls ? Math.round(((stats.summary.totalCalls - (stats.summary.totalErrors || 0)) / stats.summary.totalCalls) * 100) : 100;
  
  const distributionData = [
    { name: 'Succès', value: stats?.summary?.totalCalls - (stats?.summary?.totalErrors || 0), color: '#10b981' },
    { name: 'Erreurs', value: stats?.summary?.totalErrors || 0, color: '#ef4444' }
  ];

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-32 bg-slate-100 dark:bg-secondary-900 rounded-3xl" />
    <div className="grid grid-cols-3 gap-6">
      <div className="h-24 bg-slate-100 dark:bg-secondary-900 rounded-2xl" />
      <div className="h-24 bg-slate-100 dark:bg-secondary-900 rounded-2xl" />
      <div className="h-24 bg-slate-100 dark:bg-secondary-900 rounded-2xl" />
    </div>
  </div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-900 dark:bg-secondary-900 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group border border-slate-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary-500/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Solde disponible</p>
            <h3 className="text-3xl font-black text-primary-500">{stats?.balance?.toLocaleString() ?? "0"} <span className="text-sm font-medium text-white">XOF</span></h3>
          </div>
          <button className="relative z-10 mt-6 w-full py-3 bg-primary-500 hover:bg-primary-400 text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20">
            Demander un retrait
          </button>
        </div>

        <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Appels ce mois", value: stats?.summary?.totalCalls ?? 0, icon: <Activity className="w-5 h-5" />, color: "text-primary-500", trend: "+12%", up: true },
            { label: "Taux de succès", value: `${successRate}%`, icon: <CheckCircle className="w-5 h-5" />, color: "text-emerald-500", trend: "Stable", up: true },
            { label: "Latence moy.", value: stats?.summary?.avgResponseMs ? `${Math.round(stats.summary.avgResponseMs)}ms` : "—", icon: <Clock className="w-5 h-5" />, color: "text-blue-500", trend: "-5ms", up: true },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-secondary-900 p-5 rounded-3xl border border-slate-100 dark:border-secondary-800 shadow-sm flex flex-col justify-between hover:border-primary-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-secondary-800 flex items-center justify-center ${s.color}`}>{s.icon}</div>
                <div className={`flex items-center gap-1 text-[10px] font-black ${s.up ? 'text-emerald-500' : 'text-red-500'}`}>
                  {s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {s.trend}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white">Activité de l'API</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Appels sur les 30 derniers jours</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Live
            </div>
          </div>
          <ActivityChart data={stats?.daily || []} />
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-secondary-900 border border-slate-100 dark:border-secondary-800 shadow-sm">
          <h3 className="font-black text-slate-900 dark:text-white mb-2">Répartition</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-8">Statut des requêtes</p>
          
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{successRate}%</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Succès</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {distributionData.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-secondary-800">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span className="text-xs font-bold text-slate-600 dark:text-gray-300">{d.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
