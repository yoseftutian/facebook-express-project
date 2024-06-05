import { Router } from "express";
import {
  chatsCollection,
  client,
  messagesCollection,
  usersCollection,
} from "./database.mjs";
import { ObjectId } from "mongodb";

const router = Router();

// Route to create a new chat message
router.post("/", async (req, res, next) => {
  const session = client.startSession(); // Start a new session for transaction

  try {
    session.startTransaction();
    const chat = req.body;
    chat["createdAt"] = new Date();
    const chatCreated = await chatsCollection.insertOne(chat, { session });
    await usersCollection.updateMany(
      { _id: { $in: chat.participants.map((p) => new ObjectId(p)) } },
      {
        $push: { chats: chatCreated.insertedId },
      },
      { session }
    );
    chat["_id"] = chatCreated.insertedId;
    await session.commitTransaction();
    res.status(201).send(chat);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error saving chat message:", error);
    next(error);
  } finally {
    await session.endSession(); // End the session
  }
});

// Route to retrieve all chat messages between two users
router.get("/:id/messages", async (req, res, next) => {
  try {
    // Retrieve all chat messages between the sender and receiver
    const chat = await chatsCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    const messages = await messagesCollection
      .find({
        _id: { $in: chat.messages.map((m) => new ObjectId(m)) },
      })
      .toArray();
    // Return the chat messages
    res.status(200).send(messages);
  } catch (error) {
    next(error);
  }
});

// Route to retrieve a single chat message by ID
router.get("/:id", async (req, res, next) => {
  try {
    const user = await usersCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    if (!user.chats) {
      res.status(200).send("No chats");
    }
    const chats = await chatsCollection
      .find({ _id: { $in: user.chats } })
      .toArray();
    console.log(chats);
    if (!chats) {
      res.status(404).send({ message: "Chat not found" });
      return;
    }
    res.status(200).send(chats);
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
