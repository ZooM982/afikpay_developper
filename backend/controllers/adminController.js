const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDb } = require("../config/db");
const countries = require("../config/countries");

const adminCol = () => getDb().collection("admin_accounts");
const devCol = () => getDb().collection("developer_accounts");

// ── Admin Login ───────────────────────────────────────────────────────────
const loginAdmin = async (req, res) => {
	try {
		const { email, password } = req.body;
		
		const admin = await adminCol().findOne({ email: email.toLowerCase() });
		if (!admin) {
			return res.status(401).json({ error: "Identifiants administrateur incorrects" });
		}

		const valid = await bcrypt.compare(password, admin.passwordHash);
		if (!valid) {
			return res.status(401).json({ error: "Identifiants administrateur incorrects" });
		}

		const token = jwt.sign(
			{ adminId: admin._id.toString(), email: admin.email, role: admin.role || "admin" },
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

		return res.json({ token, email: admin.email, name: admin.name });
	} catch (err) {
		console.error("[admin] loginAdmin:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// ── Gestion des développeurs ───────────────────────────────────────────────
const getDevelopers = async (req, res) => {
	try {
		const developers = await devCol().find({}, { projection: { passwordHash: 0 } }).toArray();
		res.json({ developers });
	} catch (err) {
		console.error("[admin] getDevelopers:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const updateCountryStatus = async (req, res) => {
	try {
		const { devId } = req.params;
		const { countryCode, status } = req.body; // status: 'authorized' or 'rejected'
		const { ObjectId } = require("mongoose").mongo;

		if (!["authorized", "rejected", "pending"].includes(status)) {
			return res.status(400).json({ error: "Statut invalide" });
		}

		const result = await devCol().updateOne(
			{ _id: new ObjectId(devId), "countryAccess.countryCode": countryCode },
			{ 
				$set: { 
					"countryAccess.$.status": status,
					"countryAccess.$.updatedAt": new Date()
				} 
			}
		);

		if (result.matchedCount === 0) {
			return res.status(404).json({ error: "Développeur ou demande de pays non trouvée" });
		}

		// Envoi de notification push et in-app au développeur concerné
		const dev = await devCol().findOne({ _id: new ObjectId(devId) });
		if (dev) {
			const notification = {
				id: new ObjectId().toString(),
				title: "Mise à jour d'accès",
				message: `Votre demande d'accès pour le pays ${countryCode} a été ${status === 'authorized' ? 'approuvée' : 'rejetée'}.`,
				url: "/dashboard/countries",
				isRead: false,
				createdAt: new Date()
			};

			// Sauvegarde in-app pour le développeur
			await devCol().updateOne(
				{ _id: new ObjectId(devId) },
				{
					$push: {
						inAppNotifications: {
							$each: [notification],
							$slice: -50
						}
					}
				}
			);

			if (dev.pushSubscriptions && dev.pushSubscriptions.length > 0) {
				const { sendPushNotification } = require("../services/pushService");
				await sendPushNotification(dev.pushSubscriptions, {
					title: notification.title,
					body: notification.message,
					url: notification.url
				});
			}
		}

		res.json({ message: `Le statut du pays ${countryCode} a été mis à jour : ${status}` });
	} catch (err) {
		console.error("[admin] updateCountryStatus:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const getNotifications = async (req, res) => {
	try {
		const adminId = req.adminUser.adminId;
		const { ObjectId } = require("mongoose").mongo;
		const admin = await adminCol().findOne({ _id: new ObjectId(adminId) }, { projection: { inAppNotifications: 1 } });
		res.json({ notifications: admin?.inAppNotifications || [] });
	} catch (err) {
		console.error("[admin] getNotifications:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const getTransactions = async (req, res) => {
	try {
		const db = getDb();
		const [apiTransactions, withdrawals] = await Promise.all([
			db.collection("api_transactions").find({}).sort({ createdAt: -1 }).limit(100).toArray(),
			db.collection("withdrawals").find({}).sort({ createdAt: -1 }).limit(100).toArray()
		]);

		// Map to a unified format
		let allTx = [
			...apiTransactions.map(t => ({ ...t, type: "payin" })),
			...withdrawals.map(w => ({ 
				...w, 
				type: "payout", 
				transactionId: w._id.toString(),
				currency: "XOF",
				mode: "live"
			}))
		].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 100);

		// Populate merchant info
		const { ObjectId } = require("mongoose").mongo;
		for (let tx of allTx) {
			if (tx.clientId) {
				try {
					const dev = await db.collection("developer_accounts").findOne(
						{ _id: new ObjectId(tx.clientId) },
						{ projection: { name: 1, email: 1 } }
					);
					if (dev) {
						tx.merchantName = dev.name;
						tx.merchantEmail = dev.email;
					}
				} catch (e) {
					console.error("Error populating merchant for tx", tx.transactionId, e);
				}
			}
		}

		// Calculate global volume in the last 24h for completed transactions
		const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
		const recentTx = await db.collection("api_transactions").find({
			createdAt: { $gte: oneDayAgo },
			status: "completed"
		}).toArray();
		
		const volume24h = recentTx.reduce((sum, tx) => sum + (tx.amount || 0), 0);

		res.json({ transactions: allTx, volume24h });
	} catch (err) {
		console.error("[admin] getTransactions:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const markNotificationsAsRead = async (req, res) => {
	try {
		const adminId = req.adminUser.adminId;
		const { ObjectId } = require("mongoose").mongo;
		await adminCol().updateOne(
			{ _id: new ObjectId(adminId) },
			{ $set: { "inAppNotifications.$[elem].isRead": true } },
			{ arrayFilters: [{ "elem.isRead": false }] }
		);
		res.json({ success: true });
	} catch (err) {
		console.error("[admin] markNotificationsAsRead:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const getWithdrawals = async (req, res) => {
	try {
		const db = require("../config/db").getDb();
		const withdrawals = await db.collection("withdrawals").aggregate([
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: "developer_accounts",
					localField: "clientId",
					foreignField: "_id",
					as: "developer"
				}
			},
			{ $unwind: "$developer" },
			{
				$project: {
					_id: 1,
					amount: 1,
					recipientPhone: 1,
					operator: 1,
					status: 1,
					createdAt: 1,
					updatedAt: 1,
					"developer.name": 1,
					"developer.email": 1,
					"developer._id": 1
				}
			}
		]).toArray();
		res.json({ withdrawals });
	} catch (err) {
		console.error("[admin] getWithdrawals:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const updateWithdrawalStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;
		const { ObjectId } = require("mongoose").mongo;
		const db = require("../config/db").getDb();

		if (!["completed", "rejected"].includes(status)) {
			return res.status(400).json({ error: "Statut invalide" });
		}

		const withdrawal = await db.collection("withdrawals").findOne({ _id: new ObjectId(id) });
		if (!withdrawal) {
			return res.status(404).json({ error: "Retrait non trouvé" });
		}
		if (withdrawal.status !== "pending") {
			return res.status(400).json({ error: "Ce retrait a déjà été traité" });
		}

		// Si approuvé, on initie le transfert réel via l'API
		if (status === "completed") {
			try {
				const { initiatePayout } = require("../services/afribapay.service");
				const payoutResult = await initiatePayout(
					id, 
					withdrawal.amount, 
					withdrawal.phone || withdrawal.phoneNumber || withdrawal.recipientPhone, 
					withdrawal.operator || withdrawal.paymentMethod
				);
				console.log("Payout automatique réussi pour", id, payoutResult);
			} catch (payoutErr) {
				console.error("Erreur lors du payout automatique:", payoutErr);
				return res.status(500).json({ error: "L'approbation a échoué car le transfert automatique n'a pas pu être effectué: " + payoutErr.message });
			}
		}

		// Si rejeté, rembourser le montant au développeur
		if (status === "rejected") {
			await db.collection("developer_accounts").updateOne(
				{ _id: new ObjectId(withdrawal.clientId) },
				{ $inc: { balance: withdrawal.amount } }
			);
		}

		// Mettre à jour le statut
		await db.collection("withdrawals").updateOne(
			{ _id: new ObjectId(id) },
			{ $set: { status, updatedAt: new Date() } }
		);

		// Notifier le développeur
		const dev = await db.collection("developer_accounts").findOne({ _id: new ObjectId(withdrawal.clientId) });
		if (dev) {
			const { sendPushNotification } = require("../services/pushService");
			const notification = {
				id: new ObjectId().toString(),
				title: "Mise à jour de retrait",
				message: `Votre demande de retrait de ${withdrawal.amount} XOF a été ${status === 'completed' ? 'approuvée' : 'rejetée'}.`,
				url: "/dashboard",
				isRead: false,
				createdAt: new Date()
			};

			await db.collection("developer_accounts").updateOne(
				{ _id: new ObjectId(dev._id) },
				{
					$push: {
						inAppNotifications: {
							$each: [notification],
							$slice: -50
						}
					}
				}
			);

			if (dev.pushSubscriptions && dev.pushSubscriptions.length > 0) {
				await sendPushNotification(dev.pushSubscriptions, {
					title: notification.title,
					body: notification.message,
					url: notification.url
				});
			}
		}

		res.json({ message: `Le retrait a été ${status === 'completed' ? 'approuvé' : 'rejeté'}` });
	} catch (err) {
		console.error("[admin] updateWithdrawalStatus:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const subscribePush = async (req, res) => {
	try {
		const { subscription } = req.body;
		const adminId = req.adminUser.adminId; // From auth middleware
		const { ObjectId } = require("mongoose").mongo;

		if (!subscription) {
			return res.status(400).json({ error: "Abonnement manquant" });
		}

		// Add subscription to admin's pushSubscriptions array if it doesn't already exist
		await adminCol().updateOne(
			{ _id: new ObjectId(adminId) },
			{ 
				$addToSet: { 
					pushSubscriptions: subscription 
				} 
			}
		);

		res.json({ success: true, message: "Abonné aux notifications push" });
	} catch (err) {
		console.error("[admin] subscribePush:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

const getVapidPublicKey = (req, res) => {
	res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

const updateAdminPassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const adminId = req.adminUser.adminId;
		const { ObjectId } = require("mongoose").mongo;

		const admin = await adminCol().findOne({ _id: new ObjectId(adminId) });
		if (!admin) {
			return res.status(404).json({ error: "Administrateur non trouvé" });
		}

		const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
		if (!valid) {
			return res.status(401).json({ error: "Mot de passe actuel incorrect" });
		}

		const passwordHash = await bcrypt.hash(newPassword, 12);
		await adminCol().updateOne({ _id: new ObjectId(adminId) }, { $set: { passwordHash } });

		res.json({ message: "Mot de passe mis à jour avec succès" });
	} catch (err) {
		console.error("[admin] updateAdminPassword:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

module.exports = {
	loginAdmin,
	getDevelopers,
	updateCountryStatus,
	subscribePush,
	getVapidPublicKey,
	getNotifications,
	markNotificationsAsRead,
	getWithdrawals,
	updateWithdrawalStatus,
	getTransactions,
	updateAdminPassword,
};
