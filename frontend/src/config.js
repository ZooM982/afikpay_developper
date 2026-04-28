const environment = import.meta.env.VITE_APP_ENV || import.meta.env.MODE || "development";

const API_URLS = {
	development: "http://localhost:5001/api", // Note: New port 5001
	production: "https://afikpay-developper.vercel.app/api",
};

export const getApiUrl = () => {
	return API_URLS[environment] || API_URLS.development;
};

export const ENV = environment;
