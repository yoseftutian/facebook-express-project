import { Router } from "express";
import { client, postsCollection, usersCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
const router = Router();

router.get("/:_id", async (req, res, next) => {
  try {
    const post = await postsCollection.findOne({
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
    const insertedPost = await postsCollection.insertOne(data, { session });
      await usersCollection.updateOne(
        { _id: new ObjectId("664e2c9dfcaf4e05148211d1") },
        { $push: { posts: insertedPost.insertedId } },
        { session }
    );
    data["_id"] = insertedPost.insertedId;
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
  const session = client.startSession();

  try {
    session.startTransaction();

    const postToDelete = await postsCollection.findOne({
      _id: new ObjectId(req.params._id),
    });

    if (!postToDelete) throw new Error("Could not find post.");

    const deleted = await postsCollection.deleteOne(
      {
        _id: new ObjectId(req.params._id),
      },
      { session }
    );
    if (!deleted.deletedCount) throw new Error("Could not delete.");
    await usersCollection.updateOne(
      { _id: postToDelete.owner },
      { $pop: { posts: req.params._id } },
      { session }
    );
    await session.commitTransaction();
    res.status(200).send("Deleted");
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
});

export default router;
