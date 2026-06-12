const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectToMongo, getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

async function revert() {
    try {
        await connectToMongo();
        const db = getDb();
        const id = "6a2be6b2a7e15bd8f8b571ad"; // L'ID du retrait de tout à l'heure
        
        const result = await db.collection("withdrawals").updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: "pending" } }
        );
        
        console.log(`Résultat : ${result.modifiedCount} document(s) modifié(s). Le retrait est à nouveau 'pending'.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
revert();
