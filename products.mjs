import { Router } from "express";
import { postsCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
const router = Router();

router.get("/:_id", async (req, res, next) => {
  try {
    const user = await 
    const posts = await postsCollection.find({}).toArray();
    console.log(products);
    res.status(200).send(products);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = [...req.body];
    const insertedPosts = await postsCollection.insertMany(data);
    const posts = await postsCollection
      .find({ _id: { $in: Object.values(insertedProducts.insertedIds) } })
      .toArray();
    res.status(201).send(products);
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
    res.status(200).send("Deleted");
  } catch (error) {
    next(error);
  }
});

export default router;
