// config/countries.js
// Configuration des pays supportés
import orangeLogo from "../assets/orange.png";
import waveLogo from "../assets/wave.png";
import moovLogo from "../assets/moov.png";
import airtelLogo from "../assets/airtel.png";
import zamanicachLogo from "../assets/zamanicach.jpg";
import nitaLogo from "../assets/nita.png";
import tmoneyLogo from "../assets/tmoney.png";
import mpesaLogo from "../assets/mpesa.png";
import freeMoneyLogo from "../assets/free-money.png";
import mtnLogo from "../assets/mtnlogo.png";
import afrimoneyLogo from "../assets/afrimoney.png";
import celtiisLogo from "../assets/celtiis.png";
import corisLogo from "../assets/coris.png";
import ligdicashLogo from "../assets/ligdicah.png";
import vodacomLogo from "../assets/vodacom.png";
import amanataLogo from "../assets/amanata.png";

export const countries = [
	{
		code: "SN",
		name: "Sénégal",
		flag: "🇸🇳",
		currency: "XOF",
		phoneCode: "+221",
		phoneLength: 9,
		mobileMoneyProviders: [
			{ name: "Wave", image: waveLogo, color: "bg-blue-600", payInFee: 2, payOutFee: 2 },
			{ name: "Orange Money", image: orangeLogo, color: "bg-orange-500", payInFee: 2, payOutFee: 2 },
			{ name: "Free Money", image: freeMoneyLogo, color: "bg-red-600", payInFee: 2, payOutFee: 2 },
			{ name: "E-money", image: "", color: "bg-purple-600", payInFee: 2, payOutFee: 2 },
		],
	},
	{
		code: "CG",
		name: "Congo",
		flag: "🇨🇬",
		currency: "XAF",
		phoneCode: "+242",
		phoneLength: 9, // Avec le 0
		keepLeadingZero: true,
		mobileMoneyProviders: [
			{ name: "MTN Money", image: mtnLogo, color: "bg-[#fecb0d]", payInFee: 4.5, payOutFee: 3 },
			{ name: "Airtel Money", image: airtelLogo, color: "bg-[#e2010f]", payInFee: 4.5, payOutFee: 3 },
		],
	},
	{
		code: "CI",
		name: "Côte d'Ivoire",
		flag: "🇨🇮",
		currency: "XOF",
		phoneCode: "+225",
		phoneLength: 10,
		mobileMoneyProviders: [
			{ name: "Wave", image: waveLogo, color: "bg-blue-600", payInFee: 1.5, payOutFee: 1.5 },
			{ name: "Orange Money", image: orangeLogo, color: "bg-orange-500", payInFee: 2.5, payOutFee: 1.5 },
			{ name: "MTN Money", image: mtnLogo, color: "bg-[#fecb0d]", payInFee: 2.5, payOutFee: 1.5 },
			{ name: "Moov Money", image: moovLogo, color: "bg-blue-600", payInFee: 2.5, payOutFee: 1.5 },
		],
	},
	{
		code: "BF",
		name: "Burkina Faso",
		flag: "🇧🇫",
		currency: "XOF",
		phoneCode: "+226",
		phoneLength: 8,
		mobileMoneyProviders: [
			{ name: "Orange Money", image: orangeLogo, color: "bg-orange-500", payInFee: 3, payOutFee: 2 },
			{ name: "Moov Money", image: moovLogo, color: "bg-blue-600", payInFee: 3, payOutFee: 2 },
			{ name: "LigdiCash", image: ligdicashLogo, color: "bg-purple-600", payInFee: 3, payOutFee: 2 },
		],
	},
	{
		code: "ML",
		name: "Mali",
		flag: "🇲🇱",
		currency: "XOF",
		phoneCode: "+223",
		phoneLength: 8,
		mobileMoneyProviders: [
			{ name: "Orange Money", image: orangeLogo, color: "bg-orange-500", payInFee: 3.5, payOutFee: 2 },
			{ name: "Moov Money", image: moovLogo, color: "bg-blue-600", payInFee: 3.5, payOutFee: 2 },
		],
	},
	{
		code: "NE",
		name: "Niger",
		flag: "🇳🇪",
		currency: "XOF",
		phoneCode: "+227",
		phoneLength: 8,
		mobileMoneyProviders: [
			{ name: "Airtel Money", image: airtelLogo, color: "bg-[#e2010f]", payInFee: 4, payOutFee: 2 },
			{ name: "Moov Money", image: moovLogo, color: "bg-blue-600", payInFee: 4, payOutFee: 2 },
			{ name: "Wallet LigdiCash", image: ligdicashLogo, color: "bg-purple-600", payInFee: 4, payOutFee: 2 },
			{ name: "Amanata", image: amanataLogo, color: "bg-yellow-500", payInFee: 4, payOutFee: 2 },
			{ name: "Nita", image: nitaLogo, color: "bg-blue-800", payInFee: 4, payOutFee: 2 },
			{ name: "Zamani Cash", image: zamanicachLogo, color: "bg-[#cf007c]", payInFee: 4, payOutFee: 2 },
		],
	},
	{
		code: "CM",
		name: "Cameroun",
		flag: "🇨🇲",
		currency: "XAF",
		phoneCode: "+237",
		phoneLength: 9,
		mobileMoneyProviders: [
			{ name: "Orange Money", image: orangeLogo, color: "bg-orange-500", payInFee: 2.5, payOutFee: 2 },
			{ name: "MTN Money", image: mtnLogo, color: "bg-[#fecb0d]", payInFee: 2.5, payOutFee: 2 },
		],
	},
	{
		code: "BJ",
		name: "Bénin",
		flag: "🇧🇯",
		currency: "XOF",
		phoneCode: "+229",
		phoneLength: 10,
		mobileMoneyProviders: [
			{ name: "MTN Money", image: mtnLogo, color: "bg-[#fecb0d]", payInFee: 2.5, payOutFee: 2 },
			{ name: "Moov Money", image: moovLogo, color: "bg-blue-600", payInFee: 2.5, payOutFee: 2 },
			{ name: "Celtiis", image: celtiisLogo, color: "bg-[#71b305]", payInFee: 2.5, payOutFee: 2 },
			{ name: "Coris Cash", image: corisLogo, color: "bg-[#b1000f]", payInFee: 2.5, payOutFee: 2 },
		],
	},
	{
		code: "TG",
		name: "Togo",
		flag: "🇹🇬",
		currency: "XOF",
		phoneCode: "+228",
		phoneLength: 8,
		mobileMoneyProviders: [
			{ name: "TMoney", image: tmoneyLogo, color: "bg-yellow-400", payInFee: 3.5, payOutFee: 2 },
			{ name: "Moov Money", image: moovLogo, color: "bg-blue-600", payInFee: 3.5, payOutFee: 2 },
		],
	},
	{
		code: "GA",
		name: "Gabon",
		flag: "🇬🇦",
		currency: "XAF",
		phoneCode: "+241",
		phoneLength: 9, // Avec le 0
		minPhoneLength: 8, // Avec le 0
		keepLeadingZero: true,
		mobileMoneyProviders: [
			{ name: "Airtel Money", image: airtelLogo, color: "bg-[#e2010f]", payInFee: 3, payOutFee: 2 },
			{ name: "Moov Money", image: moovLogo, color: "bg-blue-600", payInFee: 3, payOutFee: 2 },
		],
	},
	{
		code: "CD",
		name: "RDC",
		flag: "🇨🇩",
		currency: "USD",
		phoneCode: "+243",
		phoneLength: 9, // Avec le 0
		keepLeadingZero: true,
		mobileMoneyProviders: [
			{ name: "M-Pesa", image: mpesaLogo, color: "bg-[#e60000]", payInFee: 4.5, payOutFee: 3.5 },
			{ name: "Orange Money", image: orangeLogo, color: "bg-orange-500", payInFee: 4.5, payOutFee: 3.5 },
			{ name: "Airtel Money", image: airtelLogo, color: "bg-[#e2010f]", payInFee: 4.5, payOutFee: 3.5 },
			{ name: "Afri Money", image: afrimoneyLogo, color: "bg-blue-600", payInFee: 4.5, payOutFee: 3.5 },
			{ name: "Vodacom", image: vodacomLogo, color: "bg-red-600", payInFee: 4.5, payOutFee: 3.5 },
		],
	},
	{
		code: "CF",
		name: "Centrafrique",
		flag: "🇨🇫",
		currency: "XAF",
		phoneCode: "+236",
		phoneLength: 8,
		mobileMoneyProviders: [
			{ name: "Orange Money", image: orangeLogo, color: "bg-orange-500", payInFee: 4, payOutFee: 2 },
			{ name: "Telecel", image: "", color: "bg-blue-600", payInFee: 4, payOutFee: 2 },
		],
	},
    {
		code: "TD",
		name: "Tchad",
		flag: "🇹🇩",
		currency: "XAF",
		phoneCode: "+235",
		phoneLength: 8,
		mobileMoneyProviders: [
			{ name: "Airtel Money", image: airtelLogo, color: "bg-[#e2010f]", payInFee: 6.5, payOutFee: 3 },
			{ name: "Moov Money", image: moovLogo, color: "bg-blue-600", payInFee: 6.5, payOutFee: 3 },
		],
	},
	{
		code: "GM",
		name: "Gambie",
		flag: "🇬🇲",
		currency: "GMD",
		phoneCode: "+220",
		phoneLength: 7,
		mobileMoneyProviders: [
			{ name: "Afri Money", image: afrimoneyLogo, color: "bg-purple-600", payInFee: 3.5, payOutFee: 2.5 },
		],
	},
	{
		code: "GN",
		name: "Guinée Conakry",
		flag: "🇬🇳",
		currency: "GNF",
		phoneCode: "+224",
		phoneLength: 9,
		mobileMoneyProviders: [
			{ name: "Orange Money", image: orangeLogo, color: "bg-orange-500", payInFee: 3.5, payOutFee: 2.5 },
			{ name: "MTN Money", image: mtnLogo, color: "bg-[#fecb0d]", payInFee: 3.5, payOutFee: 2.5 },
		],
	},
	{
		code: "GW",
		name: "Guinée-Bissau",
		flag: "🇬🇼",
		currency: "XOF",
		phoneCode: "+245",
		phoneLength: 9,
		mobileMoneyProviders: [
			{ name: "Orange Money", image: orangeLogo, color: "bg-orange-500", payInFee: 3.5, payOutFee: 2.5 },
		],
	},
];

export const getCountryByCode = (code) => {
	return countries.find((country) => country.code === code);
};

export const getCurrencySymbol = (currency) => {
	const symbols = {
		XOF: "XOF",
		XAF: "XAF",
		EUR: "€",
		USD: "$",
		CDF: "FC",
		GNF: "FG",
		GMD: "D",
	};
	return symbols[currency] || currency;
};
