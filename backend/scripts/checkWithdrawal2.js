const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectToMongo, getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

async function check() {
    try {
        await connectToMongo();
        const db = getDb();
        const id = "6a2be6b2a7e15bd8f8b571ad";
        const doc = await db.collection("withdrawals").findOne({ _id: new ObjectId(id) });
        console.log(JSON.stringify(doc, null, 2));
        
        // Let's also revert it back to pending just in case the backend marked it as "failed" because of the 500
        await db.collection("withdrawals").updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: "pending" } }
        );

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
