const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const http = require("http");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { connectToMongo } = require("./config/db");

const developerRoutes = require("./routes/developerRoutes");
const apiV1Routes = require("./routes/apiV1Routes");

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json({ limit: "10kb" }));

const allowedOrigins = process.env.ALLOWED_ORIGINS
	? process.env.ALLOWED_ORIGINS.split(",")
	: [
			"http://localhost:3000",
			"http://localhost:5173",
			"https://www.afrikpay.tech",
			"https://afrikpay.tech",
		];

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);

const limiter = rateLimit({
	max: 100,
	windowMs: 15 * 60 * 1000,
	message: "Too many requests, please try again later.",
});
app.use("/api", limiter);

// Routes
app.get("/api/ping", (req, res) => res.send("pong"));
app.use("/api/developer", developerRoutes);
app.use("/api/v1", apiV1Routes);

const PORT = process.env.DEV_PORT || 5001;

connectToMongo().then(() => {
	server.listen(PORT, () => {
		console.log(`AfriKPay Developer API started on port ${PORT}`);
	});
});
