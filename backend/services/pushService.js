const webpush = require("web-push");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const mailTo = process.env.VAPID_MAILTO || "mailto:admin@afrikpay.tech";

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(mailTo, publicVapidKey, privateVapidKey);
} else {
  console.warn("VAPID keys not configured in .env. Web Push will not work.");
}

/**
 * Envoie une notification web push à une liste d'abonnements
 * @param {Array} subscriptions - Liste des objets PushSubscription
 * @param {Object} payload - Données de la notification { title, body, url, icon }
 */
const sendPushNotification = async (subscriptions, payload) => {
  if (!subscriptions || subscriptions.length === 0) return;
  
  const payloadString = JSON.stringify({
    title: payload.title || "Nouvelle notification",
    body: payload.body || "",
    url: payload.url || "/",
    icon: payload.icon || "/logo.png"
  });

  const promises = subscriptions.map((sub) =>
    webpush.sendNotification(sub, payloadString).catch(error => {
      if (error.statusCode === 404 || error.statusCode === 410) {
        // L'abonnement a expiré ou n'est plus valide, il faudrait idéalement le supprimer de la BDD ici
        console.log("Subscription has expired or is no longer valid: ", error);
      } else {
        console.error("Erreur lors de l'envoi de la notification push:", error);
      }
    })
  );

  await Promise.all(promises);
};

module.exports = {
  sendPushNotification,
};
