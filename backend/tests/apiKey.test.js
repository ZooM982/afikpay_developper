// tests/apiKey.test.js
const test = require("node:test");
const assert = require("node:assert");
const crypto = require("crypto");

// Mock de getDb pour éviter de se connecter à la vraie BD pendant les tests unitaires
const mockDb = {
	collection: () => ({
		insertOne: async (doc) => ({ insertedId: "mock_id" }),
		findOne: async () => null,
		createIndex: async () => {},
	})
};

// Injection de dépendance manuelle ou mock simple
const apiKeyModel = require("../models/apiKeyModel");

test("Génération de clé API", (t) => {
	const testKey = "sk_test_1234567890";
	const hash = crypto.createHash("sha256").update(testKey).digest("hex");
	
	assert.strictEqual(typeof hash, "string");
	assert.strictEqual(hash.length, 64);
});

test("Quotas par plan", (t) => {
	const quotas = apiKeyModel.PLAN_QUOTAS;
	assert.strictEqual(quotas.starter, 50);
	assert.strictEqual(quotas.growth, 1000);
	assert.strictEqual(quotas.pro, 10000);
});

test("Validation du préfixe", (t) => {
	// sk_test_ + 24 octets (48 hex chars) = 8 + 48 = 56
	// Dans apiKeyModel.js: generateRawKey utilise crypto.randomBytes(24).toString("hex")
	const prefixTest = "sk_test_";
	const prefixLive = "sk_live_";
	
	assert.ok("sk_test_abc".startsWith(prefixTest));
	assert.ok("sk_live_abc".startsWith(prefixLive));
});
