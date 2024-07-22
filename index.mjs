import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Products from "./products.mjs";
import Posts from "./posts.mjs";
import Groups from "./groups.mjs";
import users from "./users.mjs";
import chatRoutes from "./chats.mjs";
import freinds from "./freinds.mjs";
import { expressjwt as jwt } from "express-jwt";
import dotenv from "dotenv";
import cors from "cors";
import { chatsCollection, client, messagesCollection } from "./database.mjs";
import { ObjectId } from "mongodb";

// Load environment variables from a .env file
dotenv.config();

// Object to keep track of connected sockets
const sockets = {};

// Initialize Express app
const app = express();
const port = 3005;

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Enable JSON body parsing in requests
app.use(express.json());

// Create an HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins (for development)
  },
});

// JWT Middleware to protect routes
app.use(
  jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
  }).unless({ path: ["/users/login", "/users/register"] }) // Exclude login and register routes from JWT protection
);

// Define routes
app.use("/products", Products);
app.use("/posts", Posts);
app.use("/users", users);
app.use("/groups", Groups);
app.use("/chats", chatRoutes);
app.use("/freinds", freinds);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send({ message: err.message });
});

// Handle new Socket.IO connections
io.on("connection", (socket) => {
  const { id } = socket.handshake.query; // Extract user ID from handshake query
  sockets[id] = socket.id; // Map user ID to socket ID
  console.log("A user connected:", socket.id);

  // Listen for chat messages
  socket.on("chat message", async (msg) => {
    // msg: { content, type, sender, chat_id, participants }
    const session = client.startSession(); // Start a MongoDB session
    try {
      session.startTransaction(); // Begin a transaction

      const { participants, ...message } = msg; // Extract participants from the message
      const messageCreated = await messagesCollection.insertOne(message, {
        session,
      }); // Insert message into messages collection

      await chatsCollection.updateOne(
        { _id: new ObjectId(message.chat_id) },
        { $push: { messages: messageCreated.insertedId } },
        { session }
      ); // Update the chat document with the new message ID

      await session.commitTransaction(); // Commit the transaction

      message["_id"] = messageCreated.insertedId; // Add the inserted ID to the message object

      io.to(
        participants.map((p) => sockets[p]).filter((p) => p !== undefined)
      ).emit("chat message", message); // Emit the message to all participants

    } catch (error) {
      console.error(error);
      await session.abortTransaction(); // Abort the transaction on error
    } finally {
      await session.endSession(); // End the session
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    for (const key in sockets) {
      if (sockets.hasOwnProperty(key) && sockets[key] == socket.id) {
        delete sockets[key]; // Remove the socket ID from the sockets object
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
