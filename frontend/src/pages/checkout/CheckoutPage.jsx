import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../config';
import { ShieldCheck, Smartphone, Loader2, CheckCircle, AlertTriangle, CreditCard } from 'lucide-react';

const CheckoutPage = () => {
  const { id } = useParams(); // sessionId
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [operator, setOperator] = useState("");
  const [otp, setOtp] = useState("");
  const [paying, setPaying] = useState(false);
  const [step, setStep] = useState(1);
  const [payError, setPayError] = useState(null);
  
  const API = getApiUrl();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`${API}/v1/checkout/sessions/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Session introuvable");
        setSession(data);
        if (data.countries && data.countries.length > 0) {
          const defaultCountry = data.countries[0];
          setCountryCode(defaultCountry.code);
          if (defaultCountry.mobileMoneyProviders.length > 0) {
            setOperator(defaultCountry.mobileMoneyProviders[0].name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""));
          }
        }
        if (data.status === "paid") {
          setStep(3);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id, API]);

  // Polling for status updates when in step 2 (Waiting for USSD/External validation)
  useEffect(() => {
    let interval;
    if (step === 2 && id) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API}/v1/checkout/sessions/${id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === "paid") {
              setStep(3);
              setTimeout(() => {
                window.location.href = data.successUrl;
              }, 2000);
            } else if (data.status === "failed") {
              setPayError("Le paiement a échoué ou a été refusé.");
              setStep(1);
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [step, id, API]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaying(true);
    setPayError(null);
    
    // Simulate USSD push waiting...
    setTimeout(async () => {
      setStep(2); // Waiting screen
      
      try {
        const res = await fetch(`${API}/v1/checkout/sessions/${id}/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientPhone: phone,
            countryCode, 
            operator,
            otp: operator === 'orange_money' ? otp : undefined
          })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Erreur de paiement");
        
        if (data.paymentUrl) {
          // Redirection vers Wave (ou autre lien de paiement)
          window.location.href = data.paymentUrl;
        } else if (data.successUrl) {
          // Mode test : succès immédiat
          setStep(3);
          setTimeout(() => {
            window.location.href = data.successUrl;
          }, 2000);
        } else {
          // Mode live (Orange Money etc.) : L'utilisateur valide sur son téléphone
          // Reste à l'étape 2 "En attente de validation USSD"
          // Dans une vraie application, on ferait un polling ici (setInterval) pour vérifier le statut via l'API
        }
        
      } catch (err) {
        setPayError(err.message);
        setStep(1);
      } finally {
        setPaying(false);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-secondary-900 p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Erreur</h2>
          <p className="text-slate-500 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Checkout Box */}
      <div className="w-full max-w-md bg-white dark:bg-secondary-900 rounded-[2rem] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 bg-slate-50 dark:bg-secondary-800/50 border-b border-slate-100 dark:border-secondary-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white">{session.merchantName}</h3>
              <p className="text-xs font-bold text-slate-400">Paiement sécurisé via AfriKPay</p>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="px-8 py-8 text-center border-b border-slate-100 dark:border-secondary-800">
          <p className="text-sm font-bold text-slate-400 mb-1">Montant à payer</p>
          <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {session.amount} <span className="text-xl text-slate-400">{session.currency}</span>
          </div>
        </div>

        {/* Dynamic Content based on step */}
        <div className="p-8">
          {step === 1 && (
            <form onSubmit={handlePayment} className="space-y-5 animate-fade-in">
              {payError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl text-center">
                  {payError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Pays</label>
                <div className="relative mb-4">
                  <select 
                    value={countryCode}
                    onChange={(e) => {
                      setCountryCode(e.target.value);
                      const selectedCountry = session.countries?.find(c => c.code === e.target.value);
                      if (selectedCountry && selectedCountry.mobileMoneyProviders.length > 0) {
                        setOperator(selectedCountry.mobileMoneyProviders[0].name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""));
                      } else {
                        setOperator("");
                      }
                    }}
                    className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-secondary-800 border border-slate-200 dark:border-secondary-700 text-sm font-bold text-slate-900 dark:text-white focus:border-primary-500 outline-none transition-colors appearance-none"
                  >
                    {session.countries?.map(c => (
                      <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Moyen de paiement</label>
                <div className="grid grid-cols-3 gap-2">
                  {session.countries?.find(c => c.code === countryCode)?.mobileMoneyProviders.map(op => {
                    const opId = op.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
                    return (
                      <button 
                        key={opId} 
                        type="button" 
                        onClick={() => setOperator(opId)}
                        className={`py-3 rounded-xl text-xs font-black transition-all border-2 ${operator === opId ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'border-slate-100 dark:border-secondary-800 text-slate-500 hover:border-slate-200'}`}
                      >
                        {op.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Numéro de téléphone</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+221 77 123 45 67" 
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-secondary-800 border border-slate-200 dark:border-secondary-700 text-sm font-bold text-slate-900 dark:text-white focus:border-primary-500 outline-none transition-colors" 
                  />
                </div>
              </div>

              {operator === 'orange_money' && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Code d'autorisation</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      placeholder="Obtenu via #144#391#" 
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-secondary-800 border border-slate-200 dark:border-secondary-700 text-sm font-bold text-slate-900 dark:text-white focus:border-primary-500 outline-none transition-colors" 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Composez le #144#391# sur votre téléphone pour générer le code.</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={paying || !phone || (operator === 'orange_money' && !otp)}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl hover:opacity-90 transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/10 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmer le paiement'}
              </button>
              
            </form>
          )}

          {step === 2 && (
            <div className="py-8 text-center animate-fade-in flex flex-col items-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-slate-100 dark:border-secondary-800 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
                <Smartphone className="absolute inset-0 m-auto w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Validation requise</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Veuillez confirmer le paiement de {session.amount} {session.currency} sur votre téléphone.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="py-8 text-center animate-scale-in flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Paiement Réussi !</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Vous allez être redirigé vers {session.merchantName}...
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Paiement 100% sécurisé via AfriKPay</span>
      </div>

    </div>
  );
};

export default CheckoutPage;
