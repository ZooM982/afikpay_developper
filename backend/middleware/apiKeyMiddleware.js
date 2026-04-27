// middleware/apiKeyMiddleware.js
// Middleware de validation des clés API externes (pour les clients de l'API)
const { validateApiKey, incrementUsage } = require("../models/apiKeyModel");
const { createApiLog } = require("../models/apiLogModel");

const validateExternalApiKey = async (req, res, next) => {
	const startTime = Date.now();

	// Extraire la clé depuis le header Authorization: Bearer sk_live_xxx
	const authHeader = req.headers["authorization"] || "";
	const rawKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();

	if (!rawKey || (!rawKey.startsWith("sk_live_") && !rawKey.startsWith("sk_test_"))) {
		return res.status(401).json({
			error: "Clé API manquante ou invalide",
			hint: "Fournissez votre clé dans le header: Authorization: Bearer sk_live_votre_clé",
		});
	}

	const apiKey = await validateApiKey(rawKey);

	if (!apiKey) {
		return res.status(401).json({ error: "Clé API invalide ou révoquée" });
	}

	if (apiKey.quotaExceeded) {
		return res.status(429).json({
			error: "Quota mensuel dépassé",
			plan: apiKey.plan,
			used: apiKey.usedThisMonth,
			quota: apiKey.quotaMonthly,
			resetDate: apiKey.resetDate,
			hint: `Passez au plan supérieur sur developers.afrikpay.tech`,
		});
	}

	// Incrémenter le compteur
	await incrementUsage(apiKey._id);

	// Attacher les infos à la requête
	req.apiKey = apiKey;

	// Logger la requête (en arrière-plan, sans bloquer la réponse)
	const logRequest = async (statusCode) => {
		const responseTimeMs = Date.now() - startTime;
		await createApiLog({
			apiKeyId: apiKey._id,
			clientId: apiKey.clientId,
			endpoint: req.path,
			method: req.method,
			statusCode,
			responseTimeMs,
			ip: req.ip,
			userAgent: req.headers["user-agent"],
		}).catch(() => {}); // Ne jamais bloquer sur les logs
	};

	// Intercepter la fin de la réponse pour logger le status code
	const originalSend = res.send.bind(res);
	res.send = function (body) {
		logRequest(res.statusCode);
		return originalSend(body);
	};

	next();
};

module.exports = { validateExternalApiKey };
