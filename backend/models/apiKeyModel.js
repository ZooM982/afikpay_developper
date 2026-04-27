// models/apiKeyModel.js
const { getDb } = require("../config/db");
const crypto = require("crypto");

const hashKey = (rawKey) =>
	crypto.createHash("sha256").update(rawKey).digest("hex");

const generateRawKey = (environment = "live") => {
	const prefix = environment === "test" ? "sk_test_" : "sk_live_";
	return `${prefix}${crypto.randomBytes(24).toString("hex")}`;
};

const PLAN_QUOTAS = {
	starter: 50,
	growth: 1000,
	pro: 10000,
	enterprise: 999999999,
};

const getCollection = () => getDb().collection("api_keys");

const createApiKey = async ({ clientId, plan = "starter", environment = "live", label = "" }) => {
	const collection = getCollection();
	const { ObjectId } = require("mongoose").mongo;

	const rawKey = generateRawKey(environment);
	const keyHash = hashKey(rawKey);
	const keyPrefix = rawKey.substring(0, 16);
	const quota = PLAN_QUOTAS[plan] ?? PLAN_QUOTAS.starter;

	const doc = {
		clientId: typeof clientId === "string" ? new ObjectId(clientId) : clientId,
		keyHash,
		keyPrefix,
		environment,
		plan,
		label: label || `Clé ${plan} — ${new Date().toLocaleDateString("fr-FR")}`,
		status: "active",
		quotaMonthly: quota,
		usedThisMonth: 0,
		resetDate: getNextMonthReset(),
		createdAt: new Date(),
		lastUsedAt: null,
	};

	const result = await collection.insertOne(doc);
	collection.createIndex({ keyHash: 1 }, { unique: true }).catch(() => {});
	collection.createIndex({ clientId: 1 }).catch(() => {});

	return { ...doc, _id: result.insertedId, rawKey };
};

const validateApiKey = async (rawKey) => {
	const collection = getCollection();
	if (!rawKey || typeof rawKey !== "string") return null;

	const keyHash = hashKey(rawKey);
	const doc = await collection.findOne({ keyHash, status: "active" });
	if (!doc) return null;

	if (doc.usedThisMonth >= doc.quotaMonthly) return { ...doc, quotaExceeded: true };

	if (doc.resetDate && new Date() > new Date(doc.resetDate)) {
		await collection.updateOne({ _id: doc._id }, {
			$set: { usedThisMonth: 0, resetDate: getNextMonthReset() },
		});
		doc.usedThisMonth = 0;
	}

	return doc;
};

const incrementUsage = async (keyId) => {
	const { ObjectId } = require("mongoose").mongo;
	const id = typeof keyId === "string" ? new ObjectId(keyId) : keyId;
	await getCollection().updateOne({ _id: id }, {
		$inc: { usedThisMonth: 1 },
		$set: { lastUsedAt: new Date() },
	});
};

const getClientKeys = async (clientId) => {
	const { ObjectId } = require("mongoose").mongo;
	const id = typeof clientId === "string" ? new ObjectId(clientId) : clientId;
	return await getCollection()
		.find({ clientId: id }, { projection: { keyHash: 0 } })
		.sort({ createdAt: -1 })
		.toArray();
};

const revokeApiKey = async (keyId, clientId) => {
	const { ObjectId } = require("mongoose").mongo;
	const id = typeof keyId === "string" ? new ObjectId(keyId) : keyId;
	const cId = typeof clientId === "string" ? new ObjectId(clientId) : clientId;
	return await getCollection().updateOne(
		{ _id: id, clientId: cId },
		{ $set: { status: "revoked", revokedAt: new Date() } },
	);
};

const updateApiKeyPlan = async (keyId, newPlan) => {
	const { ObjectId } = require("mongoose").mongo;
	const id = typeof keyId === "string" ? new ObjectId(keyId) : keyId;
	const quota = PLAN_QUOTAS[newPlan] ?? PLAN_QUOTAS.starter;
	return await getCollection().updateOne({ _id: id }, {
		$set: { plan: newPlan, quotaMonthly: quota, updatedAt: new Date() },
	});
};

function getNextMonthReset() {
	const now = new Date();
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

module.exports = {
	createApiKey,
	validateApiKey,
	incrementUsage,
	getClientKeys,
	revokeApiKey,
	updateApiKeyPlan,
	PLAN_QUOTAS,
};
