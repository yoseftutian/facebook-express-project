import { Router } from "express";
import { productsCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
const router = Router();

router.get("/", async (req, res, next) => {
  try {

    const products = await productsCollection.find().toArray();
    console.log(products);
    res.status(200).send(products);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = [...req.body];
    const insertedProducts = await productsCollection.insertMany(data);
    const products = await productsCollection
      .find({ _id: { $in: Object.values(insertedProducts.insertedIds) } })
      .toArray();
    res.status(201).send(products);

    console.log();
  } catch (error) {
    next(error);
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
