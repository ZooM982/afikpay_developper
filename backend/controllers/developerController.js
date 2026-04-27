// controllers/developerController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDb } = require("../config/db");
const { createApiKey, getClientKeys, revokeApiKey } = require("../models/apiKeyModel");
const { getClientLogs, getClientUsageStats } = require("../models/apiLogModel");

const devCol = () => getDb().collection("developer_accounts");

// ─── Inscription développeur ─────────────────────────────────────────────────
const registerDeveloper = async (req, res) => {
	try {
		const { name, email, company = "", useCase = "", password, plan = "starter" } = req.body;
		if (!name || !email || !password) return res.status(400).json({ error: "name, email, password requis" });
		if (password.length < 8) return res.status(400).json({ error: "Mot de passe trop court (min 8 car.)" });

		const exists = await devCol().findOne({ email: email.toLowerCase() });
		if (exists) return res.status(409).json({ error: "Un compte existe déjà avec cet email" });

		const hash = await bcrypt.hash(password, 12);
		const doc = {
			name,
			email: email.toLowerCase(),
			company,
			useCase,
			passwordHash: hash,
			plan,
			status: "active",
			createdAt: new Date(),
		};
		const result = await devCol().insertOne(doc);
		const clientId = result.insertedId;

		// Générer la première clé API automatiquement
		const keyData = await createApiKey({ clientId, plan, environment: "live", label: `Clé ${plan} — Principale` });

		const token = jwt.sign({ devId: clientId.toString(), email: doc.email, plan }, process.env.JWT_SECRET, { expiresIn: "30d" });

		res.status(201).json({
			message: "Compte créé avec succès",
			token,
			rawKey: keyData.rawKey, // Retourné une seule fois
			keyPrefix: keyData.keyPrefix,
		});
	} catch (err) {
		console.error("[dev] registerDeveloper:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// ─── Connexion développeur ────────────────────────────────────────────────────
const loginDeveloper = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ error: "email et password requis" });

		const dev = await devCol().findOne({ email: email.toLowerCase() });
		if (!dev) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

		const valid = await bcrypt.compare(password, dev.passwordHash);
		if (!valid) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

		await devCol().updateOne({ _id: dev._id }, { $set: { lastLogin: new Date() } });

		const token = jwt.sign({ devId: dev._id.toString(), email: dev.email, plan: dev.plan }, process.env.JWT_SECRET, { expiresIn: "30d" });
		res.json({ token, name: dev.name, plan: dev.plan });
	} catch (err) {
		console.error("[dev] loginDeveloper:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// ─── Récupérer les clés d'un développeur ─────────────────────────────────────
const getDeveloperKeys = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const keys = await getClientKeys(devId);
		res.json({ keys });
	} catch (err) {
		console.error("[dev] getDeveloperKeys:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// ─── Créer une nouvelle clé ───────────────────────────────────────────────────
const createDeveloperKey = async (req, res) => {
	try {
		const { devId, plan } = req.devUser;
		const { label, environment = "live" } = req.body;

		// Vérifier le nombre de clés actives selon le plan
		const existing = await getClientKeys(devId);
		const activeCount = existing.filter(k => k.status === "active").length;
		const maxKeys = { starter: 1, growth: 3, pro: 999, enterprise: 999 };
		if (activeCount >= (maxKeys[plan] || 1)) {
			return res.status(403).json({ error: `Votre plan ${plan} est limité à ${maxKeys[plan]} clé(s) active(s). Upgradez pour en créer plus.` });
		}

		const keyData = await createApiKey({ clientId: devId, plan, environment, label });
		res.status(201).json({
			message: "Clé créée",
			keyPrefix: keyData.keyPrefix,
			rawKey: keyData.rawKey, // Une seule fois
			_id: keyData._id,
		});
	} catch (err) {
		console.error("[dev] createDeveloperKey:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// ─── Révoquer une clé ────────────────────────────────────────────────────────
const revokeDeveloperKey = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const { keyId } = req.params;
		const result = await revokeApiKey(keyId, devId);
		if (result.matchedCount === 0) return res.status(404).json({ error: "Clé non trouvée ou non autorisée" });
		res.json({ message: "Clé révoquée" });
	} catch (err) {
		console.error("[dev] revokeDeveloperKey:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// ─── Stats & Logs ─────────────────────────────────────────────────────────────
const getDeveloperStats = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const { ObjectId } = require("mongoose").mongo;
		const stats = await getClientUsageStats(devId);
		
		// Récupérer aussi le solde du développeur
		const dev = await devCol().findOne({ _id: new ObjectId(devId) }, { projection: { balance: 1 } });
		
		res.json({ 
			...stats, 
			balance: dev?.balance || 0 
		});
	} catch (err) {
		console.error("[dev] getDeveloperStats:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const getDeveloperLogs = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const page = parseInt(req.query.page) || 1;
		const limit = Math.min(parseInt(req.query.limit) || 50, 200);
		const data = await getClientLogs(devId, { page, limit });
		res.json(data);
	} catch (err) {
		console.error("[dev] getDeveloperLogs:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// ─── Profil développeur ───────────────────────────────────────────────────────
const getDeveloperProfile = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const { ObjectId } = require("mongoose").mongo;
		const dev = await devCol().findOne({ _id: new ObjectId(devId) }, { projection: { passwordHash: 0 } });
		if (!dev) return res.status(404).json({ error: "Compte introuvable" });
		res.json(dev);
	} catch (err) {
		console.error("[dev] getDeveloperProfile:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const getDeveloperTransactions = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const { ObjectId } = require("mongoose").mongo;
		const db = getDb();
		const transactions = await db.collection("api_transactions")
			.find({ clientId: new ObjectId(devId) })
			.sort({ createdAt: -1 })
			.limit(50)
			.toArray();
		res.json({ transactions });
	} catch (err) {
		console.error("[dev] getDeveloperTransactions:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const requestDeveloperWithdrawal = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const { amount, phone, operator } = req.body;
		const { ObjectId } = require("mongoose").mongo;

		if (!amount || amount <= 0) return res.status(400).json({ error: "Montant invalide" });
		if (!phone || !operator) return res.status(400).json({ error: "Téléphone et opérateur requis" });

		const db = getDb();
		const dev = await devCol().findOne({ _id: new ObjectId(devId) });

		if (!dev || (dev.balance || 0) < amount) {
			return res.status(400).json({ error: "Solde insuffisant pour ce retrait" });
		}

		// 1. Débiter le solde
		await devCol().updateOne({ _id: new ObjectId(devId) }, { $inc: { balance: -amount } });

		// 2. Créer la demande de retrait
		const withdrawal = {
			clientId: new ObjectId(devId),
			amount,
			recipientPhone: phone,
			operator,
			status: "pending",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await db.collection("withdrawals").insertOne(withdrawal);

		res.json({ message: "Demande de retrait envoyée avec succès", newBalance: dev.balance - amount });
	} catch (err) {
		console.error("[dev] requestDeveloperWithdrawal:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// Exports explicites pour éviter les erreurs de chargement
module.exports = {
	registerDeveloper,
	loginDeveloper,
	getDeveloperKeys,
	createDeveloperKey,
	revokeDeveloperKey,
	getDeveloperStats,
	getDeveloperLogs,
	getDeveloperProfile,
	getDeveloperTransactions,
	requestDeveloperWithdrawal,
};
