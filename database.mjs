import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

// Load environment variables from a .env file
dotenv.config();

// Get the MongoDB URI from environment variables
const mongoURI = process.env.SECRET_MONGO;

// Ensure the MongoDB URI is defined
if (!mongoURI) {
  throw new Error("MongoURI is not defined in environment variables");
}

// Create a MongoClient with MongoClientOptions to set the Stable API version
export const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let cluster;

try {
  // Connect to the MongoDB cluster
  cluster = await client.connect();
  console.log("Connected to MongoDB");
} catch (e) {
  console.error("Failed to connect to MongoDB", e);
  throw e;
}

// Get the database instance
const db = cluster.db("facebook");

// Define collections
export const productsCollection = db.collection("products");
export const postsCollection = db.collection("posts");
export const messagesCollection = db.collection("messages");
export const chatsCollection = db.collection("chats");
export const usersCollection = db.collection("users");
export const groupsCollection = db.collection("groups");

export default db;
