import { Router } from "express";
import { chatsCollection, usersCollection } from "./database.mjs";
import { ObjectId } from "mongodb";

const router = Router();

// Route to create a new chat message
router.post("/", async (req, res, next) => {
  try {
    const chat = req.body;
    chat["createdAt"] = new Date();
    const chatCreated = await chatsCollection.insertOne(chat);
    await usersCollection.updateMany(
      { _id: { $in: chat.participants.map((p) => new ObjectId(p)) } },
      {
        $push: { chats: chatCreated.insertedId },
      }
    );
    chat["_id"] = chatCreated.insertedId;
    res.status(201).send(chat);
  } catch (error) {
    console.error("Error saving chat message:", error);
    next(error);
  }
});

// Route to retrieve all chat messages between two users
router.get("/:senderId/:receiverId", async (req, res, next) => {
  try {
    const { senderId, receiverId } = req.params;

    // Retrieve all chat messages between the sender and receiver
    const chats = await chatsCollection
      .find({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      })
      .toArray();

    // Return the chat messages
    res.status(200).send(chats);
  } catch (error) {
    next(error);
  }
});

// Route to retrieve a single chat message by ID
router.get("/:id", async (req, res, next) => {
  try {
    const chatId = new ObjectId(req.params.id);
    const chat = await chatsCollection.findOne({ _id: chatId });
    if (!chat) {
      res.status(404).send({ message: "Chat not found" });
      return;
    }
    res.status(200).send(chat);
  } catch (error) {
    next(error);
  }
});

// Route to delete a chat message by ID
router.delete("/:id", async (req, res, next) => {
  try {
    const chatId = new ObjectId(req.params.id);
    const result = await chatsCollection.deleteOne({ _id: chatId });
    if (result.deletedCount === 0) {
      res.status(404).send({ message: "Chat not found" });
      return;
    }
    res.status(200).send({ message: "Chat deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
