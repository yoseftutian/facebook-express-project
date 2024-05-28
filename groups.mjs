import { Router } from "express";
import { client, groupsCollection, usersCollection } from "./database.mjs";
import { ObjectId } from "mongodb";

const router = Router();

router.get("/:_id", async (req, res, next) => {
  try {
    const post = await groupsCollection.findOne({
      _id: new ObjectId(req.params._id),
    });
    res.status(200).send(post);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const session = client.startSession();
  try {
    session.startTransaction();
    const data = req.body;
    const insertedgroup = await groupsCollection.insertOne(data, { session });
    await usersCollection.updateOne(
      { _id: new ObjectId(data.owner) },
      { $push: { groups: insertedgroup.insertedId } },
      { session }
    );
    data["_id"] = insertedgroup.insertedId;
    await session.commitTransaction();
    res.status(201).send(data);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
});

export default router;
