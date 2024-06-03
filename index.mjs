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
import { chatsCollection } from "./database.mjs";

dotenv.config();
const sockets = {};

const app = express();
const port = 3005;
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins (for development)
  },
});

// JWT Middleware
app.use(
  jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
  }).unless({ path: ["/users/login", "/users/register"] })
);

// Routes
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

// Socket.IO connection event
io.on("connection", (socket) => {
  const { id } = socket.handshake.query;
  sockets[id] = socket.id;
  console.log("A user connected:", socket.id);

  // Listen for chat messages
  socket.on("chat message", async (msg) => {
    console.log("Message received:", msg);

    // Save the chat message to the database
    try {
      const insertedChat = await chatsCollection.insertOne({
        message: msg,
        timestamp: new Date(),
      });
      const chatMessage = {
        _id: insertedChat.insertedId,
        message: msg,
        timestamp: new Date(),
      };
      io.emit("chat message", chatMessage); // Broadcast message to all clients
    } catch (error) {
      console.error("Error saving chat message:", error);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
