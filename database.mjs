import { MongoClient, ServerApiVersion } from "mongodb";
const uri =
  "mongodb+srv://megofacebookproject:mego12345@cluster.9vqy4la.mongodb.net/?retryWrites=true&w=majority&appName=Cluster";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    
  },
});

let cluster;
try {
  cluster = await client.connect();
} catch (e) {
  console.error(e);
}

const db = cluster.db("facebook");
export const productsCollection = db.collection("products");
export const postsCollection = db.collection("posts");

export const usersCollection = db.collection("profile");

export default db;
