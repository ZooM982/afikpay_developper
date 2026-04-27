// middleware/devAuthMiddleware.js
// Middleware d'authentification pour les comptes développeur
const jwt = require("jsonwebtoken");

const authenticateDeveloper = (req, res, next) => {
	const token = req.headers["authorization"]?.split(" ")[1];
	if (!token) return res.status(401).json({ error: "Token développeur requis" });

	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) return res.status(403).json({ error: "Token invalide ou expiré" });
		req.devUser = decoded; // { devId, email, plan }
		next();
	});
};

module.exports = { authenticateDeveloper };
