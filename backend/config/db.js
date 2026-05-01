const { MongoClient } = require("mongodb");

let client;
let db;
let transactionsCollection;
let notificationsCollection;
let usersCollection;
let clientNotificationsCollection;
let recipientsCollection;
let whatsappLogsCollection;
let countriesCollection;
let reviewsCollection;
let appSettingsCollection;

async function connectToMongo() {
	if (db) return db;
	const uri = process.env.MONGO_URI;
	if (!uri) {
		throw new Error("MONGO_URI non trouvée dans process.env");
	}
	try {
		if (!client) {
			client = new MongoClient(uri);
		}
		await client.connect();
		const dbName = process.env.MONGO_DB_NAME || "afripay";
		db = client.db(dbName);
		
		console.log(`Connecté à MongoDB - Base: ${dbName}`);
		
		transactionsCollection = db.collection("transactions");
		notificationsCollection = db.collection("notifications");
		usersCollection = db.collection("users");
		clientNotificationsCollection = db.collection("clientNotifications");
		recipientsCollection = db.collection("recipients");
		whatsappLogsCollection = db.collection("whatsappLogs");
		countriesCollection = db.collection("countries");
		reviewsCollection = db.collection("reviews");
		appSettingsCollection = db.collection("appSettings");
		
		console.log("Connecté à MongoDB");
		return db;
	} catch (err) {
		console.error("Erreur MongoDB:", err.message);
		throw err;
	}
}

const getTransactionsCollection = () => {
	if (!transactionsCollection) {
		throw new Error(
			"La collection transactions n'est pas initialisée. Appelez connectToMongo d'abord.",
		);
	}
	return transactionsCollection;
};

const getNotificationsCollection = () => {
	if (!notificationsCollection) {
		throw new Error(
			"La collection notifications n'est pas initialisée. Appelez connectToMongo d'abord.",
		);
	}
	return notificationsCollection;
};

const getUsersCollection = () => {
	if (!usersCollection) {
		throw new Error(
			"La collection users n'est pas initialisée. Appelez connectToMongo d'abord.",
		);
	}
	return usersCollection;
};

const getClientNotificationsCollection = () => {
	if (!clientNotificationsCollection) {
		throw new Error(
			"La collection clientNotifications n'est pas initialisée. Appelez connectToMongo d'abord.",
		);
	}
	return clientNotificationsCollection;
};

const getRecipientsCollection = () => {
	if (!recipientsCollection) {
		throw new Error(
			"La collection recipients n'est pas initialisée. Appelez connectToMongo d'abord.",
		);
	}
	return recipientsCollection;
};

const getWhatsappLogsCollection = () => {
	if (!whatsappLogsCollection) {
		throw new Error(
			"La collection whatsappLogs n'est pas initialisée. Appelez connectToMongo d'abord.",
		);
	}
	return whatsappLogsCollection;
};

const getCountriesCollection = () => {
	if (!countriesCollection) {
		throw new Error(
			"La collection countries n'est pas initialisée. Appelez connectToMongo d'abord.",
		);
	}
	return countriesCollection;
};

const getReviewsCollection = () => {
	if (!reviewsCollection) {
		throw new Error(
			"La collection reviews n'est pas initialisée. Appelez connectToMongo d'abord.",
		);
	}
	return reviewsCollection;
};

const getAppSettingsCollection = () => {
	if (!appSettingsCollection) {
		throw new Error(
			"La collection appSettings n'est pas initialisée. Appelez connectToMongo d'abord.",
		);
	}
	return appSettingsCollection;
};

const getDb = () => {
	if (!db) {
		throw new Error("DB not initialized. Call connectToMongo first.");
	}
	return db;
};

module.exports = {
	getDb,
	connectToMongo,
	getTransactionsCollection,
	getNotificationsCollection,
	getUsersCollection,
	getClientNotificationsCollection,
	getRecipientsCollection,
	getWhatsappLogsCollection,
	getCountriesCollection,
	getReviewsCollection,
	getAppSettingsCollection,
};
