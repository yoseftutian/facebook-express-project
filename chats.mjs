import { Router } from "express";
import { chatsCollection } from "./database.mjs"; // Import the chats collection from the database module
import { ObjectId } from "mongodb"; // Import ObjectId for handling MongoDB document IDs

const router = Router(); // Create a new router instance

router.post("/", async (req, res, next) => {
    try {
      const data = req.body;
      const insertedChat = await chatsCollection.insertOne(data);
      data["_id"] = insertedChat.insertedId; 
      res.status(201).send(data);
    } catch (error) {
      next(error);
    }
  });


export default router; // Export the router instance
