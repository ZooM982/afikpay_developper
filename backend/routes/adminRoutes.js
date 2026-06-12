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

router.get("/notifications", authenticateAdmin, adminCtrl.getNotifications);
router.put("/notifications/read", authenticateAdmin, adminCtrl.markNotificationsAsRead);

router.get("/withdrawals", authenticateAdmin, adminCtrl.getWithdrawals);
router.put("/withdrawals/:id", authenticateAdmin, adminCtrl.updateWithdrawalStatus);

router.get("/transactions", authenticateAdmin, adminCtrl.getTransactions);

router.post("/push/subscribe", authenticateAdmin, adminCtrl.subscribePush);
router.get("/push/vapid-key", authenticateAdmin, adminCtrl.getVapidPublicKey);

router.put("/settings/password", authenticateAdmin, adminCtrl.updateAdminPassword);

module.exports = router;
