import { MongoClient } from "mongodb";

export async function GET() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);

    await client.connect(); // ✅ connect

    const db = client.db("syllabi"); // your database name
    const collection = db.collection("syllabuses"); // your collection

    const data = await collection.find({}).toArray();

    await client.close(); // ✅ close (simple + safe)

    return Response.json({ success: true, data });

  } catch (error: any) {
    return Response.json({ success: false, error: error.message });
  }
}

// this file will access the mongodb client