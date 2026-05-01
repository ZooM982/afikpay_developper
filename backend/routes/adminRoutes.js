// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../middleware/adminAuthMiddleware");
const adminCtrl = require("../controllers/adminController");

// Auth
router.post("/login", adminCtrl.loginAdmin);

// Gestion développeurs
router.get("/developers", authenticateAdmin, adminCtrl.getDevelopers);
router.put("/developers/:devId/countries", authenticateAdmin, adminCtrl.updateCountryStatus);

module.exports = router;
