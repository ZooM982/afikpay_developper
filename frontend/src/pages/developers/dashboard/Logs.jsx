import React from 'react';
import { useDashboard } from './DashboardContext';
import { Activity, Clock } from 'lucide-react';

const Logs = () => {
  const { logs, loading } = useDashboard();

  if (loading) return (
    <div className="bg-white dark:bg-secondary-900 rounded-3xl border border-slate-100 dark:border-secondary-800 overflow-hidden animate-pulse">
      <div className="h-16 bg-slate-50 dark:bg-secondary-800/50" />
      {[1,2,3,4,5].map(i => <div key={i} className="h-12 border-t border-slate-100 dark:border-secondary-800" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Logs API</h3>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Dernières requêtes HTTP</p>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-3xl border border-slate-100 dark:border-secondary-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-secondary-800/50">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-secondary-800">
                <th className="px-6 py-4">Endpoint</th>
                <th className="px-6 py-4">Méthode</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Latence</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-secondary-800">
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-secondary-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-mono text-slate-600 dark:text-gray-300 max-w-[250px] truncate">{log.endpoint}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${log.method === 'POST' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {log.method}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      log.statusCode < 300 ? 'bg-emerald-100 text-emerald-700' : 
                      log.statusCode < 500 ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Clock className="w-3 h-3" /> {log.responseTimeMs}ms
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-medium italic">
                    <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    Aucun log récent.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Logs;
