import express, { json } from "express";
import Products from "./products.mjs";
import Posts from "./posts.mjs";
import users from "./users.mjs";
import dotenv from "dotenv";
import cors from "cors";

// import connectDB from './config/connectDB.mjs'; // Importing connectDB directly
// import router from './routes/index.mjs'; // Importing router directly
 
dotenv.config();

const app = express();
const port = 3005;


app.use(json());
app.use(cors());

app.use("/products", Products);
app.use("/chats", Products);
app.use("/posts", Posts);
app.use("/users", users);

// //api endpoints
// app.use('/api',router)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err.message);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
