import { Router } from "express";
import { postsCollection, productsCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const products = await postsCollection.find({}).toArray();
    console.log(products);
    res.status(200).send(products);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    const insertedPost = await postsCollection.insertOne(data);
    // update user posts list
    data["_id"] = insertedPost.insertedId;
    res.status(201).send(data);
  } catch (error) {
    next(error);
  }
});

router.delete("/:_id", async (req, res, next) => {
  try {
    const deleted = await postsCollection.deleteOne({
      _id: new ObjectId(req.params._id),
    });
    if (!deleted.deletedCount) throw new Error("Could not delete.");
    // remove from posts list in the user document
    res.status(200).send("Deleted");
  } catch (error) {
    next(error);
  }
});

export default router;
