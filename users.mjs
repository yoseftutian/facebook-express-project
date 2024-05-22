import { Router } from "express";
import { usersCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
const router = Router();

router.get("/:_id", async (req, res, next) => {
  try {
    const user = await usersCollection.findOne({
      _id: new ObjectId(req.params._id),
    });
    if (!user) {
      return res.status(404).send({ error: "Profile not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    const insertedUser = await usersCollection.insertOne(data);
    data["_id"] = insertedUser.insertedId;
    res.status(201).send(data);
  } catch (error) {
    next(error);
  }
});

export default router;
