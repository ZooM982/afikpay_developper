// services/webhookService.js
const crypto = require("crypto");
const { getDb } = require("../config/db");

/**
 * Envoie une notification Webhook au client
 * @param {string} clientId - ID du client (développeur)
 * @param {string} event - Nom de l'événement (ex: transfer.completed)
 * @param {object} payload - Données de l'événement
 */
async function sendWebhook(clientId, event, payload) {
	try {
		const { ObjectId } = require("mongoose").mongo;
		const db = getDb();
		
		// 1. Récupérer la config webhook du client
		const dev = await db.collection("developer_accounts").findOne(
			{ _id: new ObjectId(clientId) },
			{ projection: { webhookUrl: 1, webhookSecret: 1 } }
		);

		if (!dev || !dev.webhookUrl) {
			console.log(`[Webhook] Pas d'URL configurée pour le client ${clientId}`);
			return;
		}

		const timestamp = Math.floor(Date.now() / 1000);
		const webhookData = {
			event,
			timestamp,
			payload
		};

		// 2. Signer le payload (sécurité)
		const signature = crypto
			.createHmac("sha256", dev.webhookSecret || "default_secret")
			.update(`${timestamp}.${JSON.stringify(webhookData)}`)
			.digest("hex");

		console.log(`[Webhook] Envoi vers ${dev.webhookUrl} (Événement: ${event})...`);

		// 3. Envoyer la requête
		const response = await fetch(dev.webhookUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-AfriKPay-Signature": signature,
				"X-AfriKPay-Timestamp": timestamp.toString()
			},
			body: JSON.stringify(webhookData)
		});

		const status = response.ok ? "delivered" : "failed";
		const responseBody = await response.text().catch(() => "");

		// 4. Loguer la tentative
		await db.collection("webhook_logs").insertOne({
			clientId: new ObjectId(clientId),
			event,
			url: dev.webhookUrl,
			status,
			statusCode: response.status,
			response: responseBody.substring(0, 500),
			payload: webhookData,
			createdAt: new Date()
		});

		console.log(`[Webhook] Statut: ${response.status} (${status})`);

	} catch (err) {
		console.error("[Webhook] Erreur fatale:", err.message);
	}
}

module.exports = { sendWebhook };
