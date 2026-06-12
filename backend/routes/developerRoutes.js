// routes/developerRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateDeveloper } = require("../middleware/devAuthMiddleware");
const devCtrl = require("../controllers/developerController");

// ── Auth publique ──────────────────────────────────────────────────────────
router.post("/register", devCtrl.registerDeveloper);
router.post("/login", devCtrl.loginDeveloper);

// ── Routes protégées (JWT développeur) ────────────────────────────────────
router.get("/profile", authenticateDeveloper, devCtrl.getDeveloperProfile);
router.get("/keys", authenticateDeveloper, devCtrl.getDeveloperKeys);
router.post("/keys", authenticateDeveloper, devCtrl.createDeveloperKey);
router.delete("/keys/:keyId", authenticateDeveloper, devCtrl.revokeDeveloperKey);
router.get("/stats", authenticateDeveloper, devCtrl.getDeveloperStats);
router.get("/logs", authenticateDeveloper, devCtrl.getDeveloperLogs);
router.get("/transactions", authenticateDeveloper, devCtrl.getDeveloperTransactions);
router.post("/withdraw", authenticateDeveloper, devCtrl.requestDeveloperWithdrawal);
router.get("/countries", authenticateDeveloper, devCtrl.getAvailableCountries);
router.post("/countries/request", authenticateDeveloper, devCtrl.requestCountries);
router.post("/webhook", authenticateDeveloper, devCtrl.updateDeveloperWebhook);
router.post("/upgrade", authenticateDeveloper, devCtrl.upgradePlan);

router.get("/notifications", authenticateDeveloper, devCtrl.getNotifications);
router.put("/notifications/read", authenticateDeveloper, devCtrl.markNotificationsAsRead);

router.post("/push/subscribe", authenticateDeveloper, devCtrl.subscribePush);
router.get("/push/vapid-key", authenticateDeveloper, devCtrl.getVapidPublicKey);

module.exports = router;
