// routes/apiV1Routes.js
// Routes publiques de l'API commerciale — protégées par clé API sk_live_ / sk_test_
const express = require("express");
const router = express.Router();
const { validateExternalApiKey } = require("../middleware/apiKeyMiddleware");
const { getDb } = require("../config/db");
const { ObjectId } = require("mongoose").mongo;
const { countries } = require("../config/countriesData"); // données statiques

// ─── ROUTES PUBLIQUES (Utilisées par la Hosted Checkout Page) ─────────────

// GET /v1/checkout/sessions/:id
// Récupère les infos d'une session de paiement pour l'afficher au client
router.get("/checkout/sessions/:id", async (req, res) => {
	try {
		const db = getDb();
		let session = await db.collection("checkout_sessions").findOne({ sessionId: req.params.id });
		if (!session) return res.status(404).json({ error: "Session introuvable ou expirée" });
		
		const devAccount = await db.collection("developer_accounts").findOne({ _id: new ObjectId(session.clientId) });

		// --- VERIFICATION ACTIVE AUPRÈS D'AFRIBAPAY ---
		// Pour pallier aux problèmes de webhooks locaux (localhost)
		if (session.status === "pending_external" && session.transactionId && session.mode === "live") {
			const { verifyAfribapayStatus } = require("../services/afribapay.service");
			const newAfribapayStatus = await verifyAfribapayStatus(session.transactionId);
			
			if (newAfribapayStatus && newAfribapayStatus !== "pending_external") {
				const tx = await db.collection("api_transactions").findOne({ transactionId: session.transactionId });
				if (tx && tx.status === "pending_external") {
					const finalSessionStatus = newAfribapayStatus === "completed" ? "paid" : "failed";
					
					// Mise à jour DB
					await db.collection("checkout_sessions").updateOne(
						{ sessionId: session.sessionId },
						{ $set: { status: finalSessionStatus, updatedAt: new Date() } }
					);
					await db.collection("api_transactions").updateOne(
						{ transactionId: session.transactionId },
						{ $set: { status: newAfribapayStatus, updatedAt: new Date() } }
					);

					// Créditer le développeur si succès
					if (newAfribapayStatus === "completed" && devAccount) {
						await db.collection("developer_accounts").updateOne(
							{ _id: new ObjectId(session.clientId) },
							{ $inc: { balance: tx.netAmount } }
						);
						
						// Envoi webhook vers le dev (optionnel)
						if (devAccount.webhookUrl && devAccount.webhookSecret) {
							const axios = require("axios");
							const crypto = require("crypto");
							const payload = { event: "transaction.completed", data: { transactionId: tx.transactionId, amount: tx.amount, currency: tx.currency, status: "completed" }};
							const sig = crypto.createHmac("sha256", devAccount.webhookSecret).update(JSON.stringify(payload)).digest("hex");
							axios.post(devAccount.webhookUrl, payload, { headers: { "afrikpay-sign": sig } }).catch(() => {});
						}
					}
					
					// Recharger la session mise à jour
					session = await db.collection("checkout_sessions").findOne({ sessionId: req.params.id });
				}
			}
		}
		// ----------------------------------------------
		let merchantCountries = countries;
		
		if (devAccount && devAccount.countryAccess) {
			const activeCountryCodes = devAccount.countryAccess
				.filter(ca => ca.status === "active" || ca.status === "approved") // Or whatever status indicates it's active. Usually "active"
				.map(ca => ca.countryCode);
			
			if (activeCountryCodes.length > 0) {
				merchantCountries = countries.filter(c => activeCountryCodes.includes(c.code));
			} else {
				// S'il n'a aucun pays actif, on pourrait afficher une liste vide ou par défaut le Sénégal (pour la démo)
				merchantCountries = countries.filter(c => c.code === "SN");
			}
		} else {
			// S'il n'a pas encore configuré de countryAccess, on lui met SN par défaut
			merchantCountries = countries.filter(c => c.code === "SN");
		}
		
		res.json({
			sessionId: session.sessionId,
			amount: session.amount,
			currency: session.currency,
			status: session.status,
			merchantName: session.merchantName,
			createdAt: session.createdAt,
			successUrl: session.successUrl, // Needed for redirect after polling
			countries: merchantCountries // Return only authorized countries
		});
	} catch (e) {
		res.status(500).json({ error: "Erreur serveur" });
	}
});

// POST /v1/checkout/sessions/:id/pay
// Effectue le paiement d'une session
router.post("/checkout/sessions/:id/pay", async (req, res) => {
	const { recipientPhone, countryCode, operator, otp } = req.body;
	
	try {
		const db = getDb();
		const session = await db.collection("checkout_sessions").findOne({ sessionId: req.params.id });
		if (!session) return res.status(404).json({ error: "Session introuvable" });
		if (session.status === "paid") return res.status(400).json({ error: "Cette session a déjà été payée" });
		
		// Récupération de la clé API pour le plan tarifaire
		const apiKey = await db.collection("api_keys").findOne({ _id: new ObjectId(session.apiKeyId) });
		
		// Check monthly transaction limits
		const startOfMonth = new Date();
		startOfMonth.setDate(1);
		startOfMonth.setHours(0, 0, 0, 0);
		
		const txCount = await db.collection("api_transactions").countDocuments({
			clientId: new ObjectId(session.clientId),
			createdAt: { $gte: startOfMonth }
		});
		
		const limits = { starter: 50, growth: 1000, pro: 10000, enterprise: 999999999 };
		const planLimit = limits[apiKey?.plan] || 50;
		
		if (txCount >= planLimit) {
			return res.status(403).json({ error: `Limite mensuelle de transactions atteinte (${planLimit}). Veuillez upgrader votre plan.` });
		}
		
		// Vérification du pays et opérateur
		const country = countries.find(c => c.code === countryCode);
		if (!country) return res.status(422).json({ error: `Pays non supporté` });
		
		const operatorKey = operator.toLowerCase();
		const foundOp = country.mobileMoneyProviders.find(op => op.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") === operatorKey || op.name.toLowerCase() === operatorKey);
		if (!foundOp) return res.status(422).json({ error: `Opérateur non disponible` });

		let feePercent = 0.015;
		if (apiKey && apiKey.plan === "growth") feePercent = 0.01;
		if (apiKey && apiKey.plan === "pro") feePercent = 0.008;
		if (apiKey && apiKey.plan === "enterprise") feePercent = 0.005;

		const platformFee = Math.round(session.amount * feePercent);
		const operatorRate = (foundOp.payInFee + foundOp.payOutFee) / 100;
		const operatorFee = Math.round(session.amount * operatorRate);
		const totalFees = platformFee + operatorFee;
		const netAmount = session.amount - totalFees;

		// Créer la transaction
		const doc = {
			transactionId: session.mode === "test" ? `TXN_TEST_${Date.now()}` : `TXN_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
			apiKeyId: session.apiKeyId,
			clientId: session.clientId,
			status: "pending",
			mode: session.mode === "test" ? "sandbox" : "live",
			amount: session.amount,
			fee: platformFee, 
			operatorFee: operatorFee, 
			totalFees: totalFees,
			netAmount: netAmount,
			currency: session.currency,
			countryCode,
			operator: operatorKey,
			recipientPhone,
			otp_code: otp,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await db.collection("api_transactions").insertOne(doc);

		if (session.mode === "live") {
			try {
				const { initiatePayIn } = require("../services/afribapay.service");
				const baseUrl = process.env.BACKEND_URL || "http://localhost:5001";
				const notifyUrl = `${baseUrl}/api/webhooks/afribapay`;
				
				const afribapayRes = await initiatePayIn(doc, notifyUrl);
				
				// Passer la transaction en pending_external (attente de validation du client sur son tel)
				await db.collection("api_transactions").updateOne(
					{ transactionId: doc.transactionId },
					{ $set: { status: "pending_external" } }
				);
				await db.collection("checkout_sessions").updateOne(
					{ sessionId: req.params.id },
					{ $set: { status: "pending_external", transactionId: doc.transactionId, updatedAt: new Date() } }
				);

				const paymentUrl = 
					afribapayRes?.data?.payment_url || 
					afribapayRes?.payment_url || 
					afribapayRes?.data?.data?.payment_url ||
					afribapayRes?.data?.provider_link ||
					afribapayRes?.data?.data?.provider_link ||
					afribapayRes?.data?.deep_link || 
					afribapayRes?.deep_link;

				return res.status(200).json({ 
					success: true, 
					status: "pending_external", 
					transactionId: doc.transactionId, 
					message: "Validation USSD en attente",
					paymentUrl: paymentUrl
				});
			} catch (err) {
				await db.collection("api_transactions").updateOne(
					{ transactionId: doc.transactionId },
					{ $set: { status: "failed", error: err.message } }
				);
				return res.status(500).json({ error: "Erreur lors de la connexion à l'opérateur", details: err.message });
			}
		} else {
			// Mode Test: Créditer immédiatement
			await db.collection("developer_accounts").updateOne(
				{ _id: new ObjectId(session.clientId) },
				{ $inc: { balance: netAmount } }
			);

			// Marquer la session comme payée
			await db.collection("checkout_sessions").updateOne(
				{ sessionId: req.params.id },
				{ $set: { status: "paid", transactionId: doc.transactionId, updatedAt: new Date() } }
			);

			return res.status(200).json({ success: true, transactionId: doc.transactionId, successUrl: session.successUrl });
		}
	} catch (e) {
		res.status(500).json({ error: "Erreur serveur" });
	}
});

// Appliquer le middleware API Key sur les autres routes /v1/*
router.use(validateExternalApiKey);

// ─── POST /v1/checkout/sessions ────────────────────────────────────────────
// Crée une nouvelle session de paiement
router.post("/checkout/sessions", async (req, res) => {
	const { amount, currency, successUrl, cancelUrl, clientReferenceId } = req.body;
	const apiKey = req.apiKey;

	if (!amount || !currency || !successUrl) {
		return res.status(400).json({ error: "Paramètres manquants (amount, currency, successUrl)" });
	}

	try {
		const db = getDb();
		const devAccount = await db.collection("developer_accounts").findOne({ _id: new ObjectId(apiKey.clientId) });
		
		// Check monthly transaction limits
		const startOfMonth = new Date();
		startOfMonth.setDate(1);
		startOfMonth.setHours(0, 0, 0, 0);
		
		const txCount = await db.collection("api_transactions").countDocuments({
			clientId: new ObjectId(apiKey.clientId),
			createdAt: { $gte: startOfMonth }
		});
		
		const limits = { starter: 50, growth: 1000, pro: 10000, enterprise: 999999999 };
		const planLimit = limits[apiKey.plan] || 50;
		
		if (txCount >= planLimit) {
			return res.status(403).json({ error: `Limite mensuelle de transactions atteinte (${planLimit}). Veuillez upgrader votre plan.` });
		}

		const merchantName = devAccount ? devAccount.companyName : "Boutique Partenaire";

		const sessionId = `cs_${apiKey.environment === "test" ? "test" : "live"}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

		const sessionDoc = {
			sessionId,
			apiKeyId: apiKey._id,
			clientId: apiKey.clientId,
			mode: apiKey.environment,
			merchantName,
			amount,
			currency,
			successUrl,
			cancelUrl,
			clientReferenceId,
			status: "pending",
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await db.collection("checkout_sessions").insertOne(sessionDoc);

		// URL construite uniquement depuis la config serveur — jamais depuis le header Origin (évite l'open redirect)
		const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === "production" ? "https://afrikpay.tech" : "http://localhost:3001");
		const url = `${frontendUrl}/pay/${sessionId}`;

		res.status(201).json({ sessionId, url });
	} catch (e) {
		res.status(500).json({ error: "Erreur lors de la création de la session" });
	}
});

// ─── GET /v1/countries ─────────────────────────────────────────────────────
// Retourne la liste des pays et opérateurs disponibles
router.get("/countries", (req, res) => {
	const data = countries.map(c => ({
		code: c.code,
		name: c.name,
		currency: c.currency,
		phoneCode: c.phoneCode,
		phoneLength: c.phoneLength,
		operators: c.mobileMoneyProviders.map(op => ({
			name: op.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
			label: op.name,
			payInFee: op.payInFee,
			payOutFee: op.payOutFee,
		})),
	}));
	res.json({ countries: data });
});

// ─── GET /v1/rates ─────────────────────────────────────────────────────────
// Taux de change EUR → devises africaines (statiques, à remplacer par une API live)
router.get("/rates", (req, res) => {
	res.json({
		base: "EUR",
		updatedAt: new Date().toISOString(),
		rates: {
			XOF: 655.957,
			XAF: 655.957,
			USD: 1.08,
			CDF: 2950,
			GHS: 16.2,
			GNF: 9350,
		},
	});
});

// ─── POST /v1/transfer ──────────────────────────────────────────────────────
// Initier un transfert via l'API commerciale
router.post("/transfer", async (req, res) => {
	const { amount, currency, recipientPhone, recipientName, countryCode, operator } = req.body;
	const apiKey = req.apiKey; // Injecté par le middleware

	// Validation des paramètres
	if (!amount || !currency || !recipientPhone || !countryCode || !operator) {
		return res.status(400).json({
			error: "Paramètres manquants",
			required: ["amount", "currency", "recipientPhone", "countryCode", "operator"],
		});
	}

	if (typeof amount !== "number" || amount <= 0) {
		return res.status(400).json({ error: "amount doit être un nombre positif" });
	}

	// Vérifier que le pays existe
	const country = countries.find(c => c.code === countryCode);
	if (!country) {
		return res.status(422).json({ error: `Pays '${countryCode}' non supporté`, supportedCountries: countries.map(c => c.code) });
	}

	// Vérifier que l'opérateur existe pour ce pays
	const operatorKey = operator.toLowerCase();
	const foundOp = country.mobileMoneyProviders.find(
		op => op.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") === operatorKey
		|| op.name.toLowerCase() === operatorKey,
	);
	if (!foundOp) {
		return res.status(422).json({
			error: `Opérateur '${operator}' non disponible pour ${country.name}`,
			availableOperators: country.mobileMoneyProviders.map(op =>
				op.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
			),
		});
	}

	try {
		const db = getDb();
		
		// Check monthly transaction limits
		const startOfMonth = new Date();
		startOfMonth.setDate(1);
		startOfMonth.setHours(0, 0, 0, 0);
		
		const txCount = await db.collection("api_transactions").countDocuments({
			clientId: new ObjectId(apiKey.clientId),
			createdAt: { $gte: startOfMonth }
		});
		
		const limits = { starter: 50, growth: 1000, pro: 10000, enterprise: 999999999 };
		const planLimit = limits[apiKey.plan] || 50;
		
		if (txCount >= planLimit) {
			return res.status(403).json({ error: `Limite mensuelle de transactions atteinte (${planLimit}). Veuillez upgrader votre plan.` });
		}

		// Déterminer les frais selon le plan du développeur
	let feePercent = 0.015; // 1.5% par défaut (Starter)
	if (apiKey.plan === "growth") feePercent = 0.01; // 1.0%
	if (apiKey.plan === "pro") feePercent = 0.008; // 0.8%
	if (apiKey.plan === "enterprise") feePercent = 0.005; // 0.5% ou custom

	// Calcul des frais totaux (AfricaSend + Opérateur)
	const platformFee = Math.round(amount * feePercent);
	const operatorRate = (foundOp.payInFee + foundOp.payOutFee) / 100;
	const operatorFee = Math.round(amount * operatorRate);
	const totalFees = platformFee + operatorFee;
	const netAmount = amount - totalFees;

	// Préparation du document de transaction
	const doc = {
		transactionId: apiKey.environment === "test" ? `TXN_TEST_${Date.now()}` : `TXN_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
		apiKeyId: apiKey._id,
		clientId: apiKey.clientId,
		status: "pending",
		mode: apiKey.environment === "test" ? "sandbox" : "live",
		amount,
		fee: platformFee, 
		operatorFee: operatorFee, 
		totalFees: totalFees,
		netAmount: netAmount,
		currency,
		countryCode,
		operator: operatorKey,
		recipientPhone,
		recipientName: recipientName || null,
		operatorFees: { payIn: foundOp.payInFee, payOut: foundOp.payOutFee },
		createdAt: new Date(),
		updatedAt: new Date(),
	};

		// Enregistrer la transaction (même en test pour l'historique)
		await db.collection("api_transactions").insertOne(doc);

		// Créditer le solde du développeur (Activé en test pour la démo)
		await db.collection("developer_accounts").updateOne(
			{ _id: new ObjectId(apiKey.clientId) },
			{ $inc: { balance: netAmount } }
		);

		// Mode sandbox : retourner la réponse simulée mais après avoir crédité
		if (doc.mode === "sandbox") {
			return res.status(201).json({
				transactionId: doc.transactionId,
				status: doc.status,
				mode: "sandbox",
				amount: doc.amount,
				fees: { platform: platformFee, operator: operatorFee, total: totalFees },
				netAmount: doc.netAmount,
				currency: doc.currency,
				countryCode: doc.countryCode,
				operator: doc.operator,
				recipientPhone: doc.recipientPhone,
				recipientName: doc.recipientName,
				operatorFees: doc.operatorFees,
				estimatedDelivery: "2 à 15 minutes",
				createdAt: doc.createdAt,
			});
		}

		// Mode live : réponse standard
		res.status(201).json({
			transactionId: doc.transactionId,
			status: doc.status,
			amount: doc.amount,
			fees: {
				platform: doc.fee,
				operator: doc.operatorFee,
				total: doc.totalFees
			},
			netAmount: doc.netAmount,
			currency: doc.currency,
			countryCode: doc.countryCode,
			operator: doc.operator,
			recipientPhone: doc.recipientPhone,
			estimatedDelivery: "2 à 15 minutes",
			createdAt: doc.createdAt
		});

		// ─── Envoi du Webhook (Asynchrone) ───
		const { sendWebhook } = require("../services/webhookService");
		sendWebhook(apiKey.clientId.toString(), "transfer.created", {
			transactionId: doc.transactionId,
			status: doc.status,
			amount: doc.amount,
			currency: doc.currency,
			recipientPhone: doc.recipientPhone,
			netAmount: doc.netAmount,
			mode: doc.mode,
			createdAt: doc.createdAt
		}).catch(err => console.error("[Webhook Error]:", err));

	} catch (err) {
		console.error("[v1] /transfer:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
});

// ─── GET /v1/transfer/:id ───────────────────────────────────────────────────
router.get("/transfer/:id", async (req, res) => {
	const { id } = req.params;
	if (id.startsWith("TXN_TEST_")) {
		return res.json({ transactionId: id, status: "completed", mode: "sandbox" });
	}
	try {
		const db = getDb();
		const txn = await db.collection("api_transactions").findOne({ transactionId: id });
		if (!txn) return res.status(404).json({ error: "Transaction introuvable" });
		res.json({
			transactionId: txn.transactionId,
			status: txn.status,
			amount: txn.amount,
			fee: txn.fee,
			currency: txn.currency,
			createdAt: txn.createdAt,
			updatedAt: txn.updatedAt,
		});
	} catch (err) {
		res.status(500).json({ error: "Erreur serveur" });
	}
});

// ─── POST /v1/transfer/:id/callback ─────────────────────────────────────────
// Endpoint de simulation pour mettre à jour le statut d'un transfert et tester les webhooks
router.post("/transfer/:id/callback", async (req, res) => {
	const { id } = req.params;
	const { status } = req.body;

	if (!["completed", "failed"].includes(status)) {
		return res.status(400).json({ error: "Statut invalide" });
	}

	try {
		const db = getDb();
		const txn = await db.collection("api_transactions").findOne({ transactionId: id });

		if (!txn) return res.status(404).json({ error: "Transaction introuvable" });
		// Vérifier que la transaction appartient bien à la clé API appelante
		if (txn.clientId.toString() !== apiKey.clientId.toString()) {
			return res.status(403).json({ error: "Accès non autorisé à cette transaction" });
		}
		if (txn.status !== "pending") return res.status(400).json({ error: "La transaction n'est plus en attente" });

		await db.collection("api_transactions").updateOne(
			{ transactionId: id },
			{ $set: { status, updatedAt: new Date() } }
		);

		// Envoyer le webhook
		const { sendWebhook } = require("../services/webhookService");
		const eventName = status === "completed" ? "transfer.completed" : "transfer.failed";
		
		sendWebhook(txn.clientId.toString(), eventName, {
			transactionId: txn.transactionId,
			status,
			amount: txn.amount,
			currency: txn.currency,
			recipientPhone: txn.recipientPhone,
			netAmount: txn.netAmount,
			mode: txn.mode,
			updatedAt: new Date()
		}).catch(err => console.error("[Webhook Error]:", err));

		res.json({ message: "Statut mis à jour et webhook envoyé", status });
	} catch (err) {
		res.status(500).json({ error: "Erreur serveur" });
	}
});

module.exports = router;
