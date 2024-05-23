import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

// טוען את משתני הסביבה מהקובץ .env
dotenv.config();

const mongoURI = process.env.SECRET_MONGO;

if (!mongoURI) {
  throw new Error("MongoURI is not defined in environment variables");
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectToDatabase() {
  try {
    const cluster = await client.connect();
    db = cluster.db("facebook");
    console.log("Connected to MongoDB");
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
    throw e;
  }
}

await connectToDatabase();

export const productsCollection = db.collection("products");
export const postsCollection = db.collection("posts");
export const usersCollection = db.collection("users");

export default db;
