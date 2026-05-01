import React from 'react';
import { useDashboard } from './DashboardContext';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';

const Transactions = () => {
  const { apiTransactions, loading } = useDashboard();

  if (loading) return (
    <div className="bg-white dark:bg-secondary-900 rounded-3xl border border-slate-100 dark:border-secondary-800 overflow-hidden animate-pulse">
      <div className="h-16 bg-slate-50 dark:bg-secondary-800/50" />
      {[1,2,3,4,5].map(i => <div key={i} className="h-12 border-t border-slate-100 dark:border-secondary-800" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Transactions API</h3>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Rechercher..." className="pl-10 pr-4 py-2 bg-white dark:bg-secondary-900 border border-slate-200 dark:border-secondary-800 rounded-xl text-sm font-medium outline-none focus:border-primary-500" />
          </div>
          <button className="p-2 bg-white dark:bg-secondary-900 border border-slate-200 dark:border-secondary-800 rounded-xl text-slate-500"><Filter className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-3xl border border-slate-100 dark:border-secondary-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-secondary-800/50">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-secondary-800">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Bénéficiaire</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-secondary-800">
              {apiTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-secondary-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-mono text-slate-600 dark:text-gray-300">{tx.transactionId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{tx.amount?.toLocaleString()} {tx.currency}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-700 dark:text-gray-200">{tx.recipientPhone}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{tx.operator}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      tx.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
              {apiTransactions.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-medium italic">
                    <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    Aucune transaction trouvée.
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

export default Transactions;
