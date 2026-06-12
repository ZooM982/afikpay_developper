import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CancelPage = () => {
 const navigate = useNavigate();

 return (
 <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
 <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-md max-w-lg w-full text-center">
 <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
 <AlertTriangle className="w-12 h-12 text-red-500" />
 </div>
 <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Paiement Annulé</h1>
 <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
 La transaction a été annulée ou a échoué. Aucun montant n'a été débité.
 </p>
 <button 
 onClick={() => navigate('/')}
 className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-md transition-all "
 >
 Retour à l'accueil
 </button>
 </div>
 </div>
 );
};

export default CancelPage;
