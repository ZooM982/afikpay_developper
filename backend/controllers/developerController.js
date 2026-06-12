// controllers/developerController.js
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { getDb } = require("../config/db");
const { createApiKey, getClientKeys, revokeApiKey } = require("../models/apiKeyModel");
const { getClientLogs, getClientUsageStats } = require("../models/apiLogModel");
const countries = require("../config/countries");

const devCol = () => getDb().collection("developer_accounts");

// ─── Inscription développeur ─────────────────────────────────────────────────
const registerDeveloper = async (req, res) => {
	try {
		const { name, email, company = "", useCase = "", password } = req.body;
		// Le plan est toujours starter à l'inscription — il ne peut pas être choisi par le client
		const plan = "starter";
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
			webhookSecret: crypto.randomBytes(32).toString("hex"),
			status: "active",
			createdAt: new Date(),
		};
		const result = await devCol().insertOne(doc);
		const clientId = result.insertedId;

		const token = jwt.sign({ devId: clientId.toString(), email: doc.email, plan }, process.env.JWT_SECRET, { expiresIn: "30d" });

		// Envoi de l'e-mail de bienvenue
		const { sendWelcomeEmail } = require("../services/emailService");
		sendWelcomeEmail(doc.email, doc.name);

		res.status(201).json({
			message: "Compte créé avec succès",
			token,
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

const updateDeveloperProfile = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const { name, company, useCase } = req.body;
		const { ObjectId } = require("mongoose").mongo;

		if (!name) return res.status(400).json({ error: "Le nom est requis" });

		await devCol().updateOne(
			{ _id: new ObjectId(devId) },
			{ $set: { name, company, useCase, updatedAt: new Date() } }
		);

		res.json({ message: "Profil mis à jour avec succès" });
	} catch (err) {
		console.error("[dev] updateDeveloperProfile:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const updateDeveloperPassword = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const { currentPassword, newPassword } = req.body;
		const { ObjectId } = require("mongoose").mongo;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({ error: "L'ancien et le nouveau mot de passe sont requis" });
		}
		if (newPassword.length < 8) {
			return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 8 caractères" });
		}

		const dev = await devCol().findOne({ _id: new ObjectId(devId) });
		if (!dev) return res.status(404).json({ error: "Compte introuvable" });

		const valid = await bcrypt.compare(currentPassword, dev.passwordHash);
		if (!valid) return res.status(401).json({ error: "L'ancien mot de passe est incorrect" });

		const newHash = await bcrypt.hash(newPassword, 12);
		await devCol().updateOne(
			{ _id: new ObjectId(devId) },
			{ $set: { passwordHash: newHash, updatedAt: new Date() } }
		);

		res.json({ message: "Mot de passe mis à jour avec succès" });
	} catch (err) {
		console.error("[dev] updateDeveloperPassword:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const getDeveloperTransactions = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const { ObjectId } = require("mongoose").mongo;
		const db = getDb();
		let transactions = await db.collection("api_transactions")
			.find({ clientId: new ObjectId(devId) })
			.sort({ createdAt: -1 })
			.limit(50)
			.toArray();

		// Auto-verify recent pending_external transactions to fix localhost webhook issues
		const pendingTxs = transactions.filter(t => t.status === "pending_external" && t.mode === "live");
		if (pendingTxs.length > 0) {
			const { verifyAfribapayStatus } = require("../services/afribapay.service");
			const dev = await devCol().findOne({ _id: new ObjectId(devId) });
			
			for (let tx of pendingTxs) {
				// Only verify if created less than 24 hours ago
				if (new Date() - new Date(tx.createdAt) < 24 * 60 * 60 * 1000) {
					try {
						const newStatus = await verifyAfribapayStatus(tx.transactionId);
						if (newStatus && newStatus !== "pending_external") {
							// Check if still pending in DB to avoid race conditions
							const currentTx = await db.collection("api_transactions").findOne({ transactionId: tx.transactionId });
							if (currentTx && currentTx.status === "pending_external") {
								await db.collection("api_transactions").updateOne({ transactionId: tx.transactionId }, { $set: { status: newStatus, updatedAt: new Date() } });
								
								// Also update checkout_sessions
								const finalSessionStatus = newStatus === "completed" ? "paid" : "failed";
								await db.collection("checkout_sessions").updateOne({ transactionId: tx.transactionId }, { $set: { status: finalSessionStatus, updatedAt: new Date() } });
								
								tx.status = newStatus; // Update in memory for response
								
								// Credit dev if completed
								if (newStatus === "completed" && dev) {
									await devCol().updateOne({ _id: new ObjectId(devId) }, { $inc: { balance: tx.netAmount } });
									
									if (dev.webhookUrl && dev.webhookSecret) {
										const axios = require("axios");
										const crypto = require("crypto");
										const payload = { event: "transaction.completed", data: { transactionId: tx.transactionId, amount: tx.amount, currency: tx.currency, status: "completed" }};
										const sig = crypto.createHmac("sha256", dev.webhookSecret).update(JSON.stringify(payload)).digest("hex");
										axios.post(dev.webhookUrl, payload, { headers: { "afrikpay-sign": sig } }).catch(() => {});
									}
								}
							}
						}
					} catch (e) {
						console.error("Auto-verify error for", tx.transactionId, e.message);
					}
				}
			}
		}

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

		// 1. Débiter le solde de façon atomique — évite la double-dépense par requêtes parallèles
		const updatedDev = await devCol().findOneAndUpdate(
			{ _id: new ObjectId(devId), balance: { $gte: amount } },
			{ $inc: { balance: -amount } },
			{ returnDocument: "after" }
		);

		if (!updatedDev) {
			return res.status(400).json({ error: "Solde insuffisant pour ce retrait" });
		}

		const dev = updatedDev;

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

		// 3. Notifier l'admin
		try {
			const { sendPushNotification } = require("../services/pushService");
			const admins = await getDb().collection("admin_accounts").find({}).toArray();
			
			const notification = {
				id: new ObjectId().toString(),
				title: "Nouvelle demande de retrait",
				message: `Le marchand ${dev.name} a demandé un retrait de ${amount} XOF.`,
				url: "/admin/dashboard?tab=payouts",
				isRead: false,
				createdAt: new Date()
			};

			await getDb().collection("admin_accounts").updateMany({}, {
				$push: {
					inAppNotifications: {
						$each: [notification],
						$slice: -50
					}
				}
			});

			const allAdminSubscriptions = admins.reduce((acc, admin) => acc.concat(admin.pushSubscriptions || []), []);
			if (allAdminSubscriptions.length > 0) {
				await sendPushNotification(allAdminSubscriptions, {
					title: notification.title,
					body: notification.message,
					url: notification.url
				});
			}
		} catch (err) {
			console.error("[dev] error sending push to admins for withdrawal:", err);
		}

		res.json({ message: "Demande de retrait envoyée avec succès", newBalance: dev.balance - amount });
	} catch (err) {
		console.error("[dev] requestDeveloperWithdrawal:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// ─── Pays & Services ────────────────────────────────────────────────────────
const getAvailableCountries = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const { ObjectId } = require("mongoose").mongo;
		const dev = await devCol().findOne({ _id: new ObjectId(devId) }, { projection: { countryAccess: 1 } });
		
		const devCountries = dev?.countryAccess || [];
		
		const result = countries.map(c => {
			const statusObj = devCountries.find(dc => dc.countryCode === c.code);
			return {
				...c,
				status: statusObj ? statusObj.status : "not_requested",
				requestedAt: statusObj ? statusObj.requestedAt : null,
			};
		});
		
		res.json({ countries: result });
	} catch (err) {
		console.error("[dev] getAvailableCountries:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const requestCountries = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const { countryCodes } = req.body; // Array of strings: ['SN', 'CM']
		const { ObjectId } = require("mongoose").mongo;

		if (!Array.isArray(countryCodes) || countryCodes.length === 0) {
			return res.status(400).json({ error: "countryCodes requis (tableau)" });
		}

		const newRequests = countryCodes.map(code => ({
			countryCode: code,
			status: "pending",
			requestedAt: new Date(),
			updatedAt: new Date()
		}));

		// On ajoute seulement ceux qui n'existent pas déjà ou qui ont été rejetés
		for (const reqObj of newRequests) {
			await devCol().updateOne(
				{ _id: new ObjectId(devId) },
				{ $pull: { countryAccess: { countryCode: reqObj.countryCode, status: { $in: ["not_requested", "rejected"] } } } }
			);
			
			// Vérifier si déjà actif ou en attente
			const dev = await devCol().findOne({ _id: new ObjectId(devId), "countryAccess.countryCode": reqObj.countryCode });
			if (!dev) {
				await devCol().updateOne(
					{ _id: new ObjectId(devId) },
					{ $push: { countryAccess: reqObj } }
				);
			}
		}

		// Envoi de la notification push et in-app aux admins
		try {
			const { sendPushNotification } = require("../services/pushService");
			const admins = await getDb().collection("admin_accounts").find({}).toArray();
			const dev = await devCol().findOne({ _id: new ObjectId(devId) });
			
			if (dev) {
				const notification = {
					id: new ObjectId().toString(),
					title: "Nouvelle demande d'accès",
					message: `Le marchand ${dev.name} a demandé l'accès pour les pays: ${countryCodes.join(", ")}.`,
					url: "/admin/dashboard?tab=approvals",
					isRead: false,
					createdAt: new Date()
				};

				// Sauvegarde in-app pour tous les admins
				await getDb().collection("admin_accounts").updateMany({}, {
					$push: {
						inAppNotifications: {
							$each: [notification],
							$slice: -50 // Garde les 50 dernières
						}
					}
				});

				// Envoi du web push à ceux qui sont abonnés
				const allAdminSubscriptions = admins.reduce((acc, admin) => acc.concat(admin.pushSubscriptions || []), []);
				if (allAdminSubscriptions.length > 0) {
					await sendPushNotification(allAdminSubscriptions, {
						title: notification.title,
						body: notification.message,
						url: notification.url
					});
				}
			}
		} catch (err) {
			console.error("[dev] error sending push to admins:", err);
		}

		res.json({ message: "Demande de pays enregistrée avec succès. En attente d'approbation admin." });
	} catch (err) {
		console.error("[dev] requestCountries:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const getNotifications = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const { ObjectId } = require("mongoose").mongo;
		const dev = await devCol().findOne({ _id: new ObjectId(devId) }, { projection: { inAppNotifications: 1 } });
		res.json({ notifications: dev?.inAppNotifications || [] });
	} catch (err) {
		console.error("[dev] getNotifications:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const markNotificationsAsRead = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const { ObjectId } = require("mongoose").mongo;
		await devCol().updateOne(
			{ _id: new ObjectId(devId) },
			{ $set: { "inAppNotifications.$[elem].isRead": true } },
			{ arrayFilters: [{ "elem.isRead": false }] }
		);
		res.json({ success: true });
	} catch (err) {
		console.error("[dev] markNotificationsAsRead:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const updateDeveloperWebhook = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const { webhookUrl } = req.body;
		const { ObjectId } = require("mongoose").mongo;

		if (webhookUrl) {
			let parsed;
			try {
				parsed = new URL(webhookUrl);
			} catch {
				return res.status(400).json({ error: "URL invalide" });
			}
			if (!["http:", "https:"].includes(parsed.protocol)) {
				return res.status(400).json({ error: "Protocole non autorisé (http/https uniquement)" });
			}
			// Bloquer les destinations internes pour éviter le SSRF
			const blockedPatterns = [
				/^localhost$/i,
				/^127\./,
				/^10\./,
				/^172\.(1[6-9]|2\d|3[01])\./,
				/^192\.168\./,
				/^169\.254\./,           // AWS/Azure metadata
				/^metadata\.google\.internal$/i,
				/^fd[0-9a-f]{2}:/i,      // IPv6 ULA
				/^::1$/,
			];
			if (blockedPatterns.some(p => p.test(parsed.hostname))) {
				return res.status(400).json({ error: "URL non autorisée : destination interne interdite" });
			}
		}

		const dev = await devCol().findOne({ _id: new ObjectId(devId) });
		if (dev && dev.plan === "starter") {
			return res.status(403).json({ error: "Les webhooks ne sont pas disponibles sur le plan Starter. Veuillez passer au plan Growth ou Pro." });
		}

		await devCol().updateOne(
			{ _id: new ObjectId(devId) },
			{ $set: { webhookUrl: webhookUrl || null, updatedAt: new Date() } }
		);

		res.json({ message: "Configuration webhook mise à jour" });
	} catch (err) {
		console.error("[dev] updateDeveloperWebhook:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const subscribePush = async (req, res) => {
	try {
		const { subscription } = req.body;
		const { devId } = req.devUser;
		const { ObjectId } = require("mongoose").mongo;

		if (!subscription) {
			return res.status(400).json({ error: "Abonnement manquant" });
		}

		await devCol().updateOne(
			{ _id: new ObjectId(devId) },
			{ 
				$addToSet: { 
					pushSubscriptions: subscription 
				} 
			}
		);

		res.json({ success: true, message: "Abonné aux notifications push" });
	} catch (err) {
		console.error("[dev] subscribePush:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const getVapidPublicKey = (req, res) => {
	res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

const upgradePlan = async (req, res) => {
	try {
		const { devId } = req.devUser;
		const { plan } = req.body;
		
		const PLAN_PRICES = {
			starter: 0,
			growth: 10000,
			pro: 30000,
			enterprise: 50000 // Prix indicatif
		};

		if (PLAN_PRICES[plan] === undefined) {
			return res.status(400).json({ error: "Plan invalide" });
		}

		const price = PLAN_PRICES[plan];
		const { ObjectId } = require("mongodb");
		const db = getDb();
		const dev = await db.collection("developer_accounts").findOne({ _id: new ObjectId(devId) });

		if (!dev) return res.status(404).json({ error: "Développeur introuvable" });
		if (dev.plan === plan) return res.status(400).json({ error: "Vous êtes déjà sur ce plan" });

		const balance = dev.balance || 0;
		if (balance < price) {
			return res.status(400).json({ error: `Solde insuffisant pour souscrire au plan ${plan} (${price} XOF requis)` });
		}

		// Déduire le solde et mettre à jour le plan
		await db.collection("developer_accounts").updateOne(
			{ _id: new ObjectId(devId) },
			{ 
				$inc: { balance: -price },
				$set: { plan, updatedAt: new Date() }
			}
		);

		// Historiser la transaction
		if (price > 0) {
			await db.collection("withdrawals").insertOne({
				devId: new ObjectId(devId),
				devName: dev.name,
				amount: price,
				type: "subscription_fee",
				status: "completed",
				createdAt: new Date(),
				description: `Frais d'abonnement au plan ${plan}`
			});
		}

		// Mettre à jour toutes les clés existantes
		const { updateAllClientKeysPlan } = require("../models/apiKeyModel");
		await updateAllClientKeysPlan(devId, plan);

		// Générer un nouveau JWT avec le nouveau plan
		const jwt = require("jsonwebtoken");
		const token = jwt.sign({ devId: dev._id.toString(), email: dev.email, plan }, process.env.JWT_SECRET, { expiresIn: "30d" });

		res.json({ message: `Votre compte a été mis à niveau vers le plan ${plan}`, token });
	} catch (err) {
		console.error("[dev] upgradePlan:", err);
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
	getAvailableCountries,
	requestCountries,
	updateDeveloperWebhook,
	subscribePush,
	getVapidPublicKey,
	getNotifications,
	markNotificationsAsRead,
	upgradePlan,
	updateDeveloperProfile,
	updateDeveloperPassword,
};
