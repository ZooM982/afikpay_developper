import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 font-sans">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">{title}</h1>
      <p className="text-slate-600 dark:text-slate-400 font-medium max-w-md mx-auto">
        Cette page est actuellement en cours de construction. Nous travaillons dur pour vous l'apporter au plus vite.
      </p>
    </div>
  );
};

export default PlaceholderPage;
