const express = require("express");
const { getDb } = require("../config/db");
const { ObjectId } = require("mongoose").mongo;
const axios = require("axios");
const crypto = require("crypto");

const router = express.Router();

router.post("/afribapay", async (req, res) => {
	// Protection par token secret dans l'URL
	// L'URL enregistrée chez Afribapay doit inclure ?token=AFRIBAPAY_WEBHOOK_SECRET
	// ex: https://api.afrikpay.tech/api/webhooks/afribapay?token=xxx
	const webhookSecret = process.env.AFRIBAPAY_WEBHOOK_SECRET;
	if (webhookSecret) {
		const receivedToken = req.query.token || "";
		if (!receivedToken || !crypto.timingSafeEqual(
			Buffer.from(receivedToken),
			Buffer.from(webhookSecret)
		)) {
			console.warn("⚠️ Webhook Afribapay rejeté : token invalide");
			return res.status(401).json({ error: "Non autorisé" });
		}
	}

	const body = req.body;
	const data = body.data || body;

	console.log("💰 Webhook Afribapay reçu:", JSON.stringify(body, null, 2));

	try {
		let orderId =
			data.order_id ||
			body.order_id ||
			data.transaction_id ||
			body.transaction_id ||
			data.reference_id ||
			body.reference_id ||
			data.reference ||
			body.reference;

		if (!orderId) {
			console.warn("⚠️ Webhook Afribapay reçu sans transactionId:", body);
			return res.status(200).json({ message: "transactionId manquant" });
		}

		const db = getDb();
		const transaction = await db.collection("api_transactions").findOne({ transactionId: orderId });

		if (!transaction) {
			console.error(`❌ Transaction ${orderId} non trouvée lors du webhook`);
			return res.status(200).json({ error: "Transaction non trouvée" });
		}

		const rawStatus = (data.status || body.status || "").toUpperCase();
		let newStatus = null;

		if (["SUCCESS", "COMPLETED", "PAID", "ACCEPTED", "APPROVED", "SUCCESSFUL", "VALIDATED"].includes(rawStatus)) {
			newStatus = "completed";
		} else if (
			rawStatus === "FAILED" ||
			rawStatus === "CANCELLED" ||
			rawStatus === "EXPIRED" ||
			rawStatus === "REJECTED"
		) {
			newStatus = "failed";
		}

		if (newStatus && transaction.status !== newStatus) {
			// Empêcher les transitions arrière
			if (["completed", "failed", "cancelled", "refunded"].includes(transaction.status)) {
				return res.status(200).json({ message: `Transaction déjà ${transaction.status}` });
			}

			// Mise à jour de la transaction
			await db.collection("api_transactions").updateOne(
				{ transactionId: orderId },
				{ $set: { status: newStatus, updatedAt: new Date() } }
			);

			// Mettre à jour la session liée (si elle existe)
			await db.collection("checkout_sessions").updateOne(
				{ transactionId: orderId },
				{ $set: { status: newStatus === "completed" ? "paid" : "failed", updatedAt: new Date() } }
			);

			// Si succès, créditer le développeur
			let devAccount = await db.collection("developer_accounts").findOne({ _id: new ObjectId(transaction.clientId) });
			
			if (newStatus === "completed" && devAccount) {
				await db.collection("developer_accounts").updateOne(
					{ _id: new ObjectId(transaction.clientId) },
					{ $inc: { balance: transaction.netAmount } }
				);
			}

			console.log(`✅ Transaction ${orderId} mise à jour: ${newStatus}`);

			// Déclencher le webhook interne vers le serveur du développeur (s'il en a configuré)
			if (devAccount && devAccount.webhookUrl && devAccount.webhookSecret) {
				const payloadObj = {
					event: `transaction.${newStatus}`,
					data: {
						transactionId: transaction.transactionId,
						amount: transaction.amount,
						currency: transaction.currency,
						status: newStatus,
						customerPhone: transaction.recipientPhone,
						createdAt: transaction.createdAt,
						updatedAt: new Date()
					}
				};

				const payloadString = JSON.stringify(payloadObj);
				const signature = crypto.createHmac("sha256", devAccount.webhookSecret).update(payloadString).digest("hex");

				// Envoi asynchrone pour ne pas bloquer
				axios.post(devAccount.webhookUrl, payloadString, {
					headers: {
						"Content-Type": "application/json",
						"x-afrikpay-signature": signature
					},
					timeout: 5000 // timeout de 5 secondes max
				}).then((res) => {
					console.log(`📡 Webhook envoyé avec succès à ${devAccount.webhookUrl} [${res.status}]`);
				}).catch((err) => {
					console.error(`⚠️ Échec de l'envoi du webhook à ${devAccount.webhookUrl}: ${err.message}`);
				});
			}
		}

		res.status(200).json({ message: "Webhook traité" });
	} catch (err) {
		console.error("Erreur webhook Afribapay:", err);
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
