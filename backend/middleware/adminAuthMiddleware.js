// middleware/adminAuthMiddleware.js
const jwt = require("jsonwebtoken");

const authenticateAdmin = (req, res, next) => {
	const token = req.headers["authorization"]?.split(" ")[1];
	if (!token) return res.status(401).json({ error: "Token admin requis" });

	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) return res.status(403).json({ error: "Token invalide ou expiré" });
		
		if (decoded.role !== "admin") {
			return res.status(403).json({ error: "Accès refusé. Droits administrateur requis." });
		}
		
		req.adminUser = decoded;
		next();
	});
};

module.exports = { authenticateAdmin };
