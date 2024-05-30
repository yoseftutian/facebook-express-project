import { Router } from 'express';
import { chatsCollection } from './database.mjs';
import { ObjectId } from 'mongodb';

const router = Router();

// Route to create a new chat message
router.post("/", async (req, res, next) => {
  try {
    const { senderId, receiverId, message } = req.body;
    
    // Ensure senderId and receiverId are provided
    if (!senderId || !receiverId) {
      res.status(400).send({ message: "Both senderId and receiverId are required" });
      return;
    }

    // Create the chat message object
    const chatMessage = {
      senderId,
      receiverId,
      message,
      timestamp: new Date()
    };

    // Insert the chat message into the database
    const insertedChat = await chatsCollection.insertOne(chatMessage);

    // Return the inserted chat message
    res.status(201).send(insertedChat.ops[0]);
  } catch (error) {
    next(error);
  }
});

// Route to retrieve all chat messages between two users
router.get("/:senderId/:receiverId", async (req, res, next) => {
  try {
    const { senderId, receiverId } = req.params;

    // Retrieve all chat messages between the sender and receiver
    const chats = await chatsCollection.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).toArray();

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
