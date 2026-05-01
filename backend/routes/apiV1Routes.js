// routes/apiV1Routes.js
// Routes publiques de l'API commerciale — protégées par clé API sk_live_ / sk_test_
const express = require("express");
const router = express.Router();
const { validateExternalApiKey } = require("../middleware/apiKeyMiddleware");
const { getDb } = require("../config/db");
const { ObjectId } = require("mongoose").mongo;
const { countries } = require("../config/countriesData"); // données statiques

// Appliquer le middleware API Key sur toutes les routes /v1/*
router.use(validateExternalApiKey);

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

	try {
		const db = getDb();
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

module.exports = router;
