import { Router } from "express";
import { productsCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
const router = Router();


router.post("/", async (req, res) => {
    await productsCollection.insertOne(req.body);
    res.send("Product created");
  });