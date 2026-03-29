import { MongoClient } from "mongodb";

let uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("❌ MONGODB_URI is missing. Set MONGODB_URI in .env.local with mongodb:// or mongodb+srv://");
}

// Handle quoted env values (e.g., "mongodb+srv://...") from .env parsing style.
uri = uri.trim().replace(/^['"]|['"]$/g, "");

if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
  throw new Error(
    `❌ MONGODB_URI must start with mongodb:// or mongodb+srv://. Current value was: ${uri.slice(0, 20)}...`
  );
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    tlsAllowInvalidCertificates: true,
  });
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export default clientPromise;