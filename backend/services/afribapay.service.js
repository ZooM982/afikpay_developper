const axios = require("axios");
const https = require("https");
const { formatPhoneForAfribapay } = require("../utils/afribapayUtils");

const ipv4Agent = new https.Agent({ family: 4 });

const AFRIBAPAY_API_USER = process.env.AFRIBAPAY_API_USER;
const AFRIBAPAY_API_KEY = process.env.AFRIBAPAY_API_KEY;
const AFRIBAPAY_MERCHANT_KEY = process.env.AFRIBAPAY_MERCHANT_KEY;
const AFRIBAPAY_BASE_URL = (
	process.env.AFRIBAPAY_BASE_URL || "https://api.afribapay.com/v1"
).replace(/\/$/, "");

const getAccessToken = async () => {
	try {
		const auth = Buffer.from(
			`${AFRIBAPAY_API_USER}:${AFRIBAPAY_API_KEY}`
		).toString("base64");
		const response = await axios.post(
			`${AFRIBAPAY_BASE_URL}/token`,
			{},
			{
				headers: {
					Authorization: `Basic ${auth}`,
					"Content-Type": "application/json",
				},
				httpsAgent: ipv4Agent,
			}
		);
		const token =
			response.data.data?.access_token ||
			response.data.token ||
			response.data.access_token;
		if (!token) {
			console.error("Afribapay Token Missing in Response:", response.data);
			throw new Error("Access token not found in Afribapay response");
		}
		return token;
	} catch (error) {
		console.error(
			"Afribapay Auth Error:",
			error.response?.data || error.message
		);
		throw new Error("Failed to authenticate with Afribapay");
	}
};

const mapOperator = (name) => {
	const n = name.toLowerCase();
	if (n.includes("orange")) return "orange";
	if (n.includes("mtn")) return "mtn";
	if (n.includes("moov")) return "moov";
	if (n.includes("wave")) return "wave";
	if (n.includes("airtel")) return "airtel";
	if (n.includes("tmoney")) return "tmoney";
	if (n.includes("free")) return "free";
	if (n.includes("expresso")) return "expresso";
	if (n.includes("mpesa")) return "mpesa";
	if (n.includes("card") || n.includes("carte")) return "card";
	return n.split(" ")[0]; // fallback to first word
};

/**
 * Initiates a PayIn request to Afribapay
 * @param {Object} transaction - The transaction object containing amount, currency, recipientPhone, operator, etc.
 * @param {string} notifyUrl - The URL where Afribapay should send the webhook
 */
const initiatePayIn = async (transaction, notifyUrl) => {
	try {
		const token = await getAccessToken();
		const operator = mapOperator(transaction.operator);
		const country = transaction.countryCode || "SN";

		const paymentData = {
			operator: operator,
			country: country,
			phone_number: formatPhoneForAfribapay(transaction.recipientPhone, country),
			amount: Math.round(transaction.amount),
			currency: transaction.currency || "XOF",
			merchant_key: AFRIBAPAY_MERCHANT_KEY,
			order_id: transaction.transactionId,
			notify_url: notifyUrl,
			return_url: "https://afrikpay.tech/success", // Afribapay requires this
			cancel_url: "https://afrikpay.tech/cancel",  // Afribapay requires this
			lang: "fr",
		};

		if (transaction.otp_code) {
			paymentData.otp_code = transaction.otp_code;
		}

		console.log("Calling Afribapay Payin with:", JSON.stringify(paymentData, null, 2));

		const response = await axios.post(
			`${AFRIBAPAY_BASE_URL}/pay/payin`,
			paymentData,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				httpsAgent: ipv4Agent,
			}
		);

		console.log("Afribapay Full Response:", JSON.stringify(response.data, null, 2));
		return response.data;
	} catch (error) {
		console.error(
			"Afribapay Payin Error:",
			error.response?.data || error.message
		);
		throw error;
	}
};

const verifyAfribapayStatus = async (transactionId) => {
	try {
		const token = await getAccessToken();
		const response = await axios.get(
			`${AFRIBAPAY_BASE_URL}/status?order_id=${transactionId}`,
			{
				headers: { Authorization: `Bearer ${token}` },
				httpsAgent: ipv4Agent,
			}
		);
		
		const statusObj = response.data;
		// Typically status is in statusObj.status or statusObj.data.status
		const rawStatus = (statusObj.data?.status || statusObj.status || "").toUpperCase();
		
		let newStatus = null;
		if (["SUCCESS", "COMPLETED", "PAID", "ACCEPTED", "APPROVED", "SUCCESSFUL", "VALIDATED"].includes(rawStatus)) {
			newStatus = "completed";
		} else if (
			rawStatus === "FAILED" ||
			rawStatus === "CANCELLED" ||
			rawStatus === "EXPIRED" ||
			rawStatus === "REJECTED"
		) {
			newStatus = "failed";
		}
		
		return newStatus;
	} catch (error) {
		console.error("Afribapay Verify Error:", error.response?.data || error.message);
		return null;
	}
};

let rawPayoutUrl = process.env.AFRIBAPAY_PAYOUT_URL || "https://api-payout.afribapay.com/v1/pay/payout";
rawPayoutUrl = rawPayoutUrl.replace(/\/$/, "");
if (!rawPayoutUrl.includes("/v1/pay/payout") && !rawPayoutUrl.includes("/payout")) {
	rawPayoutUrl += "/v1/pay/payout";
}
const AFRIBAPAY_PAYOUT_URL = rawPayoutUrl;

const initiatePayout = async (withdrawalId, amount, phone, operator) => {
	try {
		const token = await getAccessToken();
		const countryCode = "SN"; // Defaults to SN since it's XOF/CFA
		const mappedOperator = mapOperator(operator);

		const payoutData = {
			operator: mappedOperator,
			country: countryCode,
			phone_number: formatPhoneForAfribapay(phone, countryCode),
			amount: Math.round(parseFloat(amount)),
			currency: "XOF",
			order_id: `payout-${withdrawalId}-${Date.now()}`,
			merchant_key: AFRIBAPAY_MERCHANT_KEY,
			reference_id: `ref_${withdrawalId}`,
			lang: "fr",
			return_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/success`,
			cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/cancel`,
			notify_url: `${process.env.BACKEND_URL || "http://localhost:5001"}/api/v1/webhook/afribapay`,
		};

		console.log(`🚀 [AUTO-PAYOUT AFRIBAPAY] Initiation pour ${withdrawalId}:`, payoutData);

		let response;
		if (AFRIBAPAY_API_USER.includes("sandbox")) {
			console.log("🧪 [SANDBOX SIMULATION] Simulating successful payout...");
			await new Promise((resolve) => setTimeout(resolve, 1500));
			response = {
				data: {
					status: "SUCCESS",
					message: "SUCCESS (Simulated Sandbox)",
					transaction_id: `SIM_AP_${Date.now()}`,
				},
			};
		} else {
			response = await axios.post(AFRIBAPAY_PAYOUT_URL, payoutData, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				timeout: 30000,
				httpsAgent: ipv4Agent,
			});
		}

		if (
			response &&
			response.data &&
			(response.data.status === "SUCCESS" ||
				response.data.status === "PENDING" ||
				response.data.data?.status === "SUCCESS" ||
				response.data.data?.status === "PENDING")
		) {
			return { success: true, apTransactionId: response.data.transaction_id || response.data.data?.transaction_id, payoutOrderId: payoutData.order_id };
		} else {
			const msg = response?.data?.message || "Échec de l'initiation du payout Afribapay";
			throw new Error(msg);
		}
	} catch (error) {
		const errorData = error.response?.data || {};
		if (error.response?.status === 409 || errorData.error?.code === 409) {
			return { success: true, apTransactionId: errorData.data?.transaction_id || `ap_conflict`, payoutOrderId: `conflict` };
		}
		console.error(`❌ [PAYOUT FAILED] ${withdrawalId}:`, error.message);
		throw error;
	}
};

module.exports = {
	getAccessToken,
	initiatePayIn,
	initiatePayout,
	mapOperator,
	verifyAfribapayStatus

};
