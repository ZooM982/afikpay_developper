// config/countriesData.js
// Version backend des données pays (sans imports d'images React)
const countries = [
	{ code: "SN", name: "Sénégal", currency: "XOF", phoneCode: "+221", phoneLength: 9,
		mobileMoneyProviders: [
			{ name: "Wave", payInFee: 2, payOutFee: 2 },
			{ name: "Orange Money", payInFee: 2, payOutFee: 2 },
			{ name: "Free Money", payInFee: 2, payOutFee: 2 },
			{ name: "E-money", payInFee: 2, payOutFee: 2 },
		],
	},
	{ code: "CG", name: "Congo", currency: "XAF", phoneCode: "+242", phoneLength: 9,
		mobileMoneyProviders: [
			{ name: "MTN Money", payInFee: 4.5, payOutFee: 3 },
			{ name: "Airtel Money", payInFee: 4.5, payOutFee: 3 },
		],
	},
	{ code: "CI", name: "Côte d'Ivoire", currency: "XOF", phoneCode: "+225", phoneLength: 10,
		mobileMoneyProviders: [
			{ name: "Wave", payInFee: 1.5, payOutFee: 1.5 },
			{ name: "Orange Money", payInFee: 2.5, payOutFee: 1.5 },
			{ name: "MTN Money", payInFee: 2.5, payOutFee: 1.5 },
			{ name: "Moov Money", payInFee: 2.5, payOutFee: 1.5 },
		],
	},
	{ code: "BF", name: "Burkina Faso", currency: "XOF", phoneCode: "+226", phoneLength: 8,
		mobileMoneyProviders: [
			{ name: "Orange Money", payInFee: 3, payOutFee: 2 },
			{ name: "Moov Money", payInFee: 3, payOutFee: 2 },
			{ name: "LigdiCash", payInFee: 3, payOutFee: 2 },
		],
	},
	{ code: "ML", name: "Mali", currency: "XOF", phoneCode: "+223", phoneLength: 8,
		mobileMoneyProviders: [
			{ name: "Orange Money", payInFee: 3.5, payOutFee: 2 },
			{ name: "Moov Money", payInFee: 3.5, payOutFee: 2 },
		],
	},
	{ code: "CM", name: "Cameroun", currency: "XAF", phoneCode: "+237", phoneLength: 9,
		mobileMoneyProviders: [
			{ name: "Orange Money", payInFee: 2.5, payOutFee: 2 },
			{ name: "MTN Money", payInFee: 2.5, payOutFee: 2 },
		],
	},
	{ code: "BJ", name: "Bénin", currency: "XOF", phoneCode: "+229", phoneLength: 10,
		mobileMoneyProviders: [
			{ name: "MTN Money", payInFee: 2.5, payOutFee: 2 },
			{ name: "Moov Money", payInFee: 2.5, payOutFee: 2 },
		],
	},
	{ code: "TG", name: "Togo", currency: "XOF", phoneCode: "+228", phoneLength: 8,
		mobileMoneyProviders: [
			{ name: "TMoney", payInFee: 3.5, payOutFee: 2 },
			{ name: "Moov Money", payInFee: 3.5, payOutFee: 2 },
		],
	},
	{ code: "CD", name: "RDC", currency: "USD", phoneCode: "+243", phoneLength: 9,
		mobileMoneyProviders: [
			{ name: "M-Pesa", payInFee: 4.5, payOutFee: 3.5 },
			{ name: "Orange Money", payInFee: 4.5, payOutFee: 3.5 },
			{ name: "Airtel Money", payInFee: 4.5, payOutFee: 3.5 },
			{ name: "Afri Money", payInFee: 4.5, payOutFee: 3.5 },
			{ name: "Vodacom", payInFee: 4.5, payOutFee: 3.5 },
		],
	},
	{ code: "TD", name: "Tchad", currency: "XAF", phoneCode: "+235", phoneLength: 8,
		mobileMoneyProviders: [
			{ name: "Airtel Money", payInFee: 6.5, payOutFee: 3 },
			{ name: "Moov Money", payInFee: 6.5, payOutFee: 3 },
		],
	},
	{ code: "CF", name: "Centrafrique", currency: "XAF", phoneCode: "+236", phoneLength: 8,
		mobileMoneyProviders: [
			{ name: "Orange Money", payInFee: 4, payOutFee: 2 },
			{ name: "Telecel", payInFee: 4, payOutFee: 2 },
		],
	},
	{ code: "GM", name: "Gambie", currency: "GMD", phoneCode: "+220", phoneLength: 7,
		mobileMoneyProviders: [
			{ name: "Afri Money", payInFee: 3.5, payOutFee: 2.5 },
		],
	},
	{ code: "GN", name: "Guinée Conakry", currency: "GNF", phoneCode: "+224", phoneLength: 9,
		mobileMoneyProviders: [
			{ name: "Orange Money", payInFee: 3.5, payOutFee: 2.5 },
			{ name: "MTN Money", payInFee: 3.5, payOutFee: 2.5 },
		],
	},
	{ code: "GW", name: "Guinée-Bissau", currency: "XOF", phoneCode: "+245", phoneLength: 9,
		mobileMoneyProviders: [
			{ name: "Orange Money", payInFee: 3.5, payOutFee: 2.5 },
		],
	},
	{ code: "NE", name: "Niger", currency: "XOF", phoneCode: "+227", phoneLength: 8,
		mobileMoneyProviders: [
			{ name: "Airtel Money", payInFee: 4, payOutFee: 2 },
			{ name: "Moov Money", payInFee: 4, payOutFee: 2 },
			{ name: "Wallet LigdiCash", payInFee: 4, payOutFee: 2 },
			{ name: "Amanata", payInFee: 4, payOutFee: 2 },
			{ name: "Nita", payInFee: 4, payOutFee: 2 },
			{ name: "Zamani Cash", payInFee: 4, payOutFee: 2 },
		],
	},
	{ code: "TD", name: "Tchad", currency: "XAF", phoneCode: "+235", phoneLength: 8,
		mobileMoneyProviders: [
			{ name: "Airtel Money", payInFee: 6.5, payOutFee: 3 },
			{ name: "Moov Money", payInFee: 6.5, payOutFee: 3 },
		],
	},
];

module.exports = { countries };
