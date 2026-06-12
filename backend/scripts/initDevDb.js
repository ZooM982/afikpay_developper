// scripts/initDevDb.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

async function initDb() {
	const uri = process.env.MONGO_URI;
	const dbName = process.env.MONGO_DB_NAME || "afrikpay_developers_special";

	if (!uri) {
		console.error("❌ Erreur: MONGO_URI non définie dans le .env");
		process.exit(1);
	}

	console.log(`🚀 Initialisation de la base de données: ${dbName}...`);
	const client = new MongoClient(uri);

	try {
		await client.connect();
		const db = client.db(dbName);

		// Liste des collections à créer
		const collections = [
			"developer_accounts",
			"api_keys",
			"api_logs",
			"api_transactions",
			"withdrawals",
			"countries",
			"app_settings"
		];

		for (const colName of collections) {
			const exists = await db.listCollections({ name: colName }).hasNext();
			if (!exists) {
				await db.createCollection(colName);
				console.log(`✅ Collection créée: ${colName}`);
			} else {
				console.log(`ℹ️  Collection déjà existante: ${colName}`);
			}
		}

		// Création des index pour les performances
		console.log("🛠️  Création des index...");
		
		await db.collection("developer_accounts").createIndex({ email: 1 }, { unique: true });
		await db.collection("api_keys").createIndex({ keyHash: 1 }, { unique: true });
		await db.collection("api_keys").createIndex({ clientId: 1 });
		await db.collection("api_logs").createIndex({ clientId: 1, createdAt: -1 });
		await db.collection("api_transactions").createIndex({ clientId: 1, createdAt: -1 });
		await db.collection("withdrawals").createIndex({ clientId: 1, status: 1 });

		console.log("✨ Initialisation terminée avec succès !");
	} catch (err) {
		console.error("❌ Erreur lors de l'initialisation:", err);
	} finally {
		await client.close();
	}
}

initDb();
