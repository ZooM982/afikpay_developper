const { MongoClient, ObjectId } = require('mongodb');

async function run() {
    const client = new MongoClient("mongodb://localhost:27017");
    try {
        await client.connect();
        const db = client.db("afrikpay_developers_special");
        const doc = await db.collection("withdrawals").findOne({ _id: new ObjectId("6a2be6b2a7e15bd8f8b571ad") });
        console.log(JSON.stringify(doc, null, 2));
    } finally {
        await client.close();
    }
}
run();
