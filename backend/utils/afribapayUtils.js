/**
 * Normalize phone number for Afribapay API according to country-specific rules.
 * Most countries require the local number WITHOUT the leading zero when the prefix is omitted,
 * but Afribapay usually expects just the local part.
 * 
 * @param {string} phone The raw phone number (usually already contains the prefix)
 * @param {string} countryCode The ISO country code (e.g., "SN", "CG")
 * @returns {string} The normalized phone number for the operator
 */
const formatPhoneForAfribapay = (phone, countryCode) => {
	if (!phone) return "";
	
	// 1. Nettoyage de base : garder uniquement les chiffres
	let cleaned = String(phone).replace(/\D/g, "");
	
	// 2. Gérer le préfixe international "00" (ex: 00242 -> 242)
	if (cleaned.startsWith("00")) {
		cleaned = cleaned.substring(2);
	}

	const prefixes = {
		SN: "221",
		CG: "242",
		CI: "225",
		BF: "226",
		ML: "223",
		NE: "227",
		CM: "237",
		BJ: "229",
		TG: "228",
		GA: "241",
		CD: "243",
	};

	const prefix = prefixes[countryCode];
	
	// 3. Retirer l'indicatif pays s'il est présent au début
	if (prefix && cleaned.startsWith(prefix)) {
		cleaned = cleaned.substring(prefix.length);
	}

	// 4. Gérer le 0 initial de la partie nationale
	// CONSIGNE : Ne JAMAIS couper le 0 initial, uniquement l'indicatif pays.
	// On garde donc le numéro tel quel après avoir retiré l'indicatif.
	
	return cleaned;
};

module.exports = {
	formatPhoneForAfribapay,
};
