// scripts/migrate_dev_accounts.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

async function migrate() {
	const uri = process.env.MONGO_URI;
	const sourceDbName = "afripay";
	const targetDbName = process.env.MONGO_DB_NAME || "afrikpay_developers_special";

	if (!uri) {
		console.error("❌ MONGO_URI non définie");
		process.exit(1);
	}

	const client = new MongoClient(uri);

	try {
		await client.connect();
		const sourceDb = client.db(sourceDbName);
		const targetDb = client.db(targetDbName);

		console.log(`🔍 Recherche des comptes développeurs dans ${sourceDbName}...`);
		
		// 1. Migrer les comptes (developer_accounts)
		const devs = await sourceDb.collection("developer_accounts").find({}).toArray();
		if (devs.length === 0) {
			console.log("ℹ️ Aucun compte trouvé dans la source.");
		} else {
			console.log(`📦 Migration de ${devs.length} comptes développeurs...`);
			for (const dev of devs) {
				await targetDb.collection("developer_accounts").updateOne(
					{ _id: dev._id },
					{ $set: dev },
					{ upsert: true }
				);
			}
			console.log("✅ Comptes migrés.");
		}

		// 2. Migrer les clés API associées
		const keys = await sourceDb.collection("api_keys").find({}).toArray();
		if (keys.length > 0) {
			console.log(`📦 Migration de ${keys.length} clés API...`);
			for (const key of keys) {
				await targetDb.collection("api_keys").updateOne(
					{ _id: key._id },
					{ $set: key },
					{ upsert: true }
				);
			}
			console.log("✅ Clés API migrées.");
		}

        // 3. Migrer les pays desservis (si stockés séparément ou dans les comptes, ici ils sont dans developer_accounts.countryAccess)
        // Déjà couvert par la migration des comptes.

		console.log("✨ Migration terminée !");
	} catch (err) {
		console.error("❌ Erreur de migration:", err);
	} finally {
		await client.close();
	}
}

migrate();
