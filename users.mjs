import { Router } from "express";
import { usersCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await usersCollection.findOne({ email });
    console.log(user);
    if (await bcrypt.compare(password, user["password"])) {
      delete user["password"];
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        algorithm: "HS256",
      });
      const data = { user_id: user._id, token };
      res.status(200).send(data);
    } else {
      throw new Error("Password does not match");
    }
  } catch (error) {
    next(error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const { password } = req.body;
    const saltRounds = 10;
    req.body["password"] = await bcrypt.hash(password, saltRounds);
    await usersCollection.insertOne(req.body);
    res.status(201).send("User Created");
  } catch (error) {
    next(error);
  }
});


router.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    data.password = hashedPassword;
    const insertedUser = await usersCollection.insertOne(data);
    // console.log(insertedUser);
    data["_id"] = insertedUser.insertedId;
    console.log(data);
    res.status(201).send(data);
  } catch (error) {
    next(error);
  }
});








router.get("/:_id", async (req, res, next) => {
    try {
        const user = await usersCollection.findOne({ _id: new ObjectId(req.params._id) });
        if (!user) {
            return res.status(404).send({ error: "Profile not found" });
        }
        res.status(200).send(user);
    } catch (error) {
        next(error);
    }
});


router.post("/addFreind/", async (req, res, next) => {
    try {
        const userId = req.body.userId;
        const freindId = req.body.FreindId;
        const result = await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $push: { freinds: new ObjectId(freindId) } });
        console.log(result);
        res.status(201).send(`added sucssesfuly ${result.modifiedCount}`);
    }
    catch (error) {
        next(error)
    }
})














export default router;
