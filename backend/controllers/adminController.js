// controllers/adminController.js
const jwt = require("jsonwebtoken");
const { getDb } = require("../config/db");
const countries = require("../config/countries");

const devCol = () => getDb().collection("developer_accounts");

// ── Admin Login ───────────────────────────────────────────────────────────
const loginAdmin = async (req, res) => {
	try {
		const { email, password } = req.body;
		
		// Pour la démo/v1, on vérifie contre l'email de l'env
		// En prod, on utiliserait une collection admin_accounts avec password haché
		if (email === process.env.ADMIN_EMAIL_1 && password === "admin123") { // password temporaire à changer
			const token = jwt.sign(
				{ email, role: "admin" },
				process.env.JWT_SECRET,
				{ expiresIn: "1d" }
			);
			return res.json({ token, email, name: "Administrator" });
		}
		
		res.status(401).json({ error: "Identifiants administrateur incorrects" });
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

		res.json({ message: `Le statut du pays ${countryCode} a été mis à jour : ${status}` });
	} catch (err) {
		console.error("[admin] updateCountryStatus:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

module.exports = {
	loginAdmin,
	getDevelopers,
	updateCountryStatus,
};
