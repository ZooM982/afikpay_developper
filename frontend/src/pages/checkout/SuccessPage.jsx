import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
 const navigate = useNavigate();

 return (
 <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
 <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-md max-w-lg w-full text-center">
 <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
 <CheckCircle className="w-12 h-12 text-green-500" />
 </div>
 <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Paiement Réussi !</h1>
 <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
 Votre transaction a été traitée avec succès. Merci pour votre confiance !
 </p>
 <button 
 onClick={() => navigate('/')}
 className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-8 rounded-md transition-all hover:"
 >
 Retour à l'accueil
 </button>
 </div>
 </div>
 );
};

export default SuccessPage;
