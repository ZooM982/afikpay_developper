// tests/countries.test.js
const test = require("node:test");
const assert = require("node:assert");
const { countries } = require("../config/countriesData");

test("Validation des données pays", (t) => {
	assert.ok(Array.isArray(countries));
	assert.ok(countries.length >= 8, "Il devrait y avoir au moins 8 pays");
	
	const senegal = countries.find(c => c.code === "SN");
	assert.ok(senegal);
	assert.strictEqual(senegal.currency, "XOF");
	assert.ok(senegal.mobileMoneyProviders.length > 0);
});

test("Structure des opérateurs", (t) => {
	for (const country of countries) {
		for (const op of country.mobileMoneyProviders) {
			assert.ok(op.name, `L'opérateur dans ${country.name} doit avoir un nom`);
			assert.ok(typeof op.payInFee === "number");
			assert.ok(typeof op.payOutFee === "number");
		}
	}
});
