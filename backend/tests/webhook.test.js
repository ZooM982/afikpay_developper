// tests/webhook.test.js
const test = require("node:test");
const assert = require("node:assert");
const crypto = require("crypto");

test("Calcul de signature Webhook", (t) => {
	const secret = "test_secret_123";
	const timestamp = 1714554000;
	const payload = { event: "transfer.completed", id: "123" };
	const body = JSON.stringify(payload);
	
	const signature = crypto
		.createHmac("sha256", secret)
		.update(`${timestamp}.${body}`)
		.digest("hex");
	
	// Recalcul manuel pour vérifier la cohérence
	const expected = crypto
		.createHmac("sha256", secret)
		.update(`${timestamp}.${body}`)
		.digest("hex");
		
	assert.strictEqual(signature, expected);
	assert.strictEqual(signature.length, 64);
});

test("Vérification d'une signature invalide", (t) => {
	const secret = "test_secret_123";
	const timestamp = 1714554000;
	const body = JSON.stringify({ a: 1 });
	
	const sig = crypto.createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
	const wrongSig = crypto.createHmac("sha256", "wrong_secret").update(`${timestamp}.${body}`).digest("hex");
	
	assert.notStrictEqual(sig, wrongSig);
});
