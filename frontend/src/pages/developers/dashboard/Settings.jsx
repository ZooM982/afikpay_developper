import React, { useState, useEffect } from 'react';
import { Save, Lock, User, Building, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { useDashboard } from './DashboardContext';

export default function Settings() {
  const { profile, refresh, API, headers } = useDashboard();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    company: '',
    useCase: '',
    email: '' // readonly
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        company: profile.company || '',
        useCase: profile.useCase || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API}/developer/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: profileForm.name,
          company: profileForm.company,
          useCase: profileForm.useCase
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Profil mis à jour avec succès !");
        refresh(); // update navbar
      } else {
        setError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/developer/password`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Mot de passe mis à jour avec succès !");
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Paramètres du compte</h1>
        <p className="text-gray-500 dark:text-gray-400">Gérez vos informations personnelles et vos préférences de sécurité.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
          <ShieldAlert size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-600 dark:text-green-400">
          <Save size={20} />
          <p className="font-medium">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 pb-4 px-4 border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500 font-medium'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <User size={18} />
          Profil
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 pb-4 px-4 border-b-2 transition-colors ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500 font-medium'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Lock size={18} />
          Sécurité
        </button>
      </div>

      <div className="bg-white dark:bg-[#0b1120] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6">
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Informations personnelles</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  disabled
                  value={profileForm.email}
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-2">L'adresse email ne peut pas être modifiée.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Building size={16} />
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  value={profileForm.company}
                  onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Optionnel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cas d'usage
                </label>
                <select
                  value={profileForm.useCase}
                  onChange={(e) => setProfileForm({ ...profileForm, useCase: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Sélectionnez un cas d'usage</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="saas">SaaS & Abonnements</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Enregistrer les modifications
              </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Changer de mot de passe</h2>
            
            <div className="max-w-md space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-12"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-4 top-[14px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showCurrentPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    minLength={8}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-12"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-4 top-[14px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Le mot de passe doit contenir au moins 8 caractères.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    minLength={8}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-12"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-4 top-[14px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Lock size={18} />
                )}
                Mettre à jour le mot de passe
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
