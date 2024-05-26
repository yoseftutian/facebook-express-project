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
let cluster;

try {
  cluster = await client.connect();
  console.log("Connected to MongoDB");
} catch (e) {
  console.error("Failed to connect to MongoDB", e);
  throw e;
}

const db = cluster.db("facebook");
export const productsCollection = db.collection("products");
export const postsCollection = db.collection("posts");

export const chatsCollection = db.collection("chats");

export const usersCollection = db.collection("users");

export default db;
