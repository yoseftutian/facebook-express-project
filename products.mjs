import { Router } from "express";
import { client, productsCollection, usersCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const products = await productsCollection.find().toArray();
    // console.log(products);
    res.status(200).send(products);
  } catch (error) {
    next(error);
  }
});

router.get("/:_id", async (req, res, next) => {
  try {
    const product = await productsCollection.findOne({
      _id: new ObjectId(req.params._id),
    });
    // console.log(product);
    res.status(200).send(product);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const session = client.startSession();

  try {
    session.startTransaction();

    const data = req.body;
    const insertedProduct = await productsCollection.insertOne(data, {
      session,
    });
    await usersCollection.updateOne(
      { _id: new ObjectId(data.owner) },
      { $push: { products: insertedProduct.insertedId } },
      { session }
    );
    data["_id"] = insertedProduct.insertedId;
    await session.commitTransaction();
    res.status(201).send(data);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
});

router.delete("/:_id", async (req, res, next) => {
  try {
    const deleted = await productsCollection.deleteOne({
      _id: new ObjectId(req.params._id),
    });
    if (!deleted.deletedCount) throw new Error("Could not delete.");
    res.status(200).send("Deleted");
  } catch (error) {
    next(error);
  }
});

export default router;
