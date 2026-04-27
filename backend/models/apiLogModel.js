// models/apiLogModel.js
const { getDb } = require("../config/db");

const getCollection = () => getDb().collection("api_logs");

const createApiLog = async ({
	apiKeyId, clientId, endpoint, method, statusCode,
	responseTimeMs, transactionId = null, amount = null,
	fee = null, ip = null, userAgent = null, errorMessage = null,
}) => {
	const collection = getCollection();
	const { ObjectId } = require("mongoose").mongo;

	const doc = {
		apiKeyId: apiKeyId ? (typeof apiKeyId === "string" ? new ObjectId(apiKeyId) : apiKeyId) : null,
		clientId: clientId ? (typeof clientId === "string" ? new ObjectId(clientId) : clientId) : null,
		endpoint,
		method: method?.toUpperCase(),
		statusCode,
		responseTimeMs: responseTimeMs || null,
		transactionId: transactionId || null,
		amount: amount || null,
		fee: fee || null,
		ip: ip || null,
		userAgent: userAgent || null,
		errorMessage: errorMessage || null,
		createdAt: new Date(),
	};

	// TTL : logs conservés 90 jours
	collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }).catch(() => {});
	collection.createIndex({ clientId: 1, createdAt: -1 }).catch(() => {});

	await collection.insertOne(doc);
	return doc;
};

const getClientLogs = async (clientId, { page = 1, limit = 50 } = {}) => {
	const collection = getCollection();
	const { ObjectId } = require("mongoose").mongo;
	const id = typeof clientId === "string" ? new ObjectId(clientId) : clientId;
	const skip = (page - 1) * limit;

	const [logs, total] = await Promise.all([
		collection.find({ clientId: id }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
		collection.countDocuments({ clientId: id }),
	]);

	return { logs, total, page, limit, pages: Math.ceil(total / limit) };
};

const getClientUsageStats = async (clientId) => {
	const collection = getCollection();
	const { ObjectId } = require("mongoose").mongo;
	const id = typeof clientId === "string" ? new ObjectId(clientId) : clientId;
	const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

	const [daily, summaryArr] = await Promise.all([
		collection.aggregate([
			{ $match: { clientId: id, createdAt: { $gte: since } } },
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					calls: { $sum: 1 },
					errors: { $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] } },
					avgResponseMs: { $avg: "$responseTimeMs" },
				},
			},
			{ $sort: { _id: 1 } },
		]).toArray(),
		collection.aggregate([
			{ $match: { clientId: id, createdAt: { $gte: since } } },
			{
				$group: {
					_id: null,
					totalCalls: { $sum: 1 },
					totalErrors: { $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] } },
					avgResponseMs: { $avg: "$responseTimeMs" },
					totalAmount: { $sum: { $ifNull: ["$amount", 0] } },
					totalFees: { $sum: { $ifNull: ["$fee", 0] } },
				},
			},
		]).toArray(),
	]);

	return {
		daily,
		summary: summaryArr[0] || { totalCalls: 0, totalErrors: 0, avgResponseMs: 0, totalAmount: 0, totalFees: 0 },
	};
};

const getAllLogsAdmin = async ({ page = 1, limit = 100 } = {}) => {
	const collection = getCollection();
	const skip = (page - 1) * limit;
	const [logs, total] = await Promise.all([
		collection.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
		collection.countDocuments(),
	]);
	return { logs, total, page, limit, pages: Math.ceil(total / limit) };
};

module.exports = { createApiLog, getClientLogs, getClientUsageStats, getAllLogsAdmin };
