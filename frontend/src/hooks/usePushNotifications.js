import { useState, useEffect } from 'react';

// Fonction utilitaire pour convertir la clé VAPID en Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const usePushNotifications = (apiBaseUrl, token) => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then(swReg => {
          // Check if already subscribed
          swReg.pushManager.getSubscription()
            .then(sub => {
              if (sub) {
                setSubscription(sub);
                setIsSubscribed(true);
              }
            });
        })
        .catch(err => console.error("Service Worker Error", err));
    }
  }, []);

  const subscribeUser = async () => {
    if (!isSupported || !token) return false;
    
    try {
      const swReg = await navigator.serviceWorker.ready;
      
      // Get VAPID public key from backend
      const response = await fetch(`${apiBaseUrl}/push/vapid-key`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (!data.publicKey) throw new Error("Clé VAPID non trouvée");
      
      const convertedVapidKey = urlBase64ToUint8Array(data.publicKey.trim());
      
      // Subscribe to PushManager
      const pushSubscription = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      
      // Send subscription to backend
      const subRes = await fetch(`${apiBaseUrl}/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subscription: pushSubscription })
      });
      
      if (!subRes.ok) throw new Error("Erreur lors de l'enregistrement de l'abonnement côté serveur");
      
      setSubscription(pushSubscription);
      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error("Erreur de souscription push:", err);
      // Fallback si permission refusée
      if (Notification.permission === 'denied') {
        alert("Les notifications sont bloquées par votre navigateur. Veuillez les autoriser dans les paramètres.");
      } else {
        alert("Erreur: " + err.message);
      }
      return false;
    }
  };

  return { isSupported, isSubscribed, subscribeUser };
};
