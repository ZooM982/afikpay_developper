const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function initAdmin() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;
  
  if (!uri || !dbName) {
    console.error("MONGO_URI or MONGO_DB_NAME missing in .env");
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const adminCol = db.collection("admin_accounts");

    const email = (process.env.INITIAL_ADMIN_EMAIL || "Roll@afrikpay.tech").toLowerCase();
    const password = process.env.INITIAL_ADMIN_PASSWORD || "RollTech242";
    const name = process.env.INITIAL_ADMIN_NAME || "Super Admin";

    const exists = await adminCol.findOne({ email });
    const passwordHash = await bcrypt.hash(password, 12);

    if (exists) {
      console.log("Admin account already exists:", email);
      console.log("Updating password...");
      await adminCol.updateOne({ email }, { $set: { passwordHash, name } });
    } else {
      await adminCol.insertOne({
        name,
        email,
        passwordHash,
        role: "super_admin",
        createdAt: new Date(),
        status: "active"
      });
    }



    console.log("------------------------------------------");
    console.log("Admin Account Created Successfully!");
    console.log("Email: ", email);
    console.log("Password: ", password);
    console.log("------------------------------------------");
    console.log("IMPORTANT: Please save these credentials safely.");

  } catch (err) {
    console.error("Error creating admin account:", err);
  } finally {
    await client.close();
  }
}

initAdmin();
