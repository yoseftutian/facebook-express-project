import { Router } from "express";
import { usersCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

// POST /login route for user authentication
router.post("/login", async (req, res, next) =>   {
  try {
    const { email, password } = req.body;
    const user = await usersCollection.findOne({ email }); // Find user by email
    console.log(user);
    if (await bcrypt.compare(password, user["password"])) {
      // Compare provided password with stored hashed password
      delete user["password"]; // Remove password from user object for security reasons
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        algorithm: "HS256",
      }); // Create JWT token
      const data = { user_id: user._id, token, profileImg: user.profileImg }; // Prepare response data
      res.status(200).send(data); // Send response
    } else {
      throw new Error("Password does not match"); // Handle incorrect password
    }
  } catch (error) {
    next(error); // Pass error to error handler
  }
});

// POST /register route for user registration
router.post("/register", async (req, res, next) => {
  try {
    const { password } = req.body;
    const saltRounds = 10;
    req.body["password"] = await bcrypt.hash(password, saltRounds); // Hash password
    await usersCollection.insertOne(req.body); // Insert new user into collection
    res.status(201).send("User Created"); // Send success response
  } catch (error) {
    next(error); // Pass error to error handler
  }
});

// GET /:_id route to get user profile by ID
router.get("/:_id", async (req, res, next) => {
  const userId = new ObjectId(req.params._id);
  try {
    const user = await usersCollection.findOne({ _id: userId });
    if (!user) {
      return res.status(404).send({ error: "Profile not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    next(error); // Pass error to error handler
  }
});

// POST / route to create a new user (similar to /register)
router.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds); // Hash password
    data.password = hashedPassword;
    const insertedUser = await usersCollection.insertOne(data); // Insert new user into collection
    data["_id"] = insertedUser.insertedId; // Add the generated ID to the user data
    console.log(data);
    res.status(201).send(data); // Send response with user data
  } catch (error) {
    next(error); // Pass error to error handler
  }
});

//it uses to get list of idis and to send their picture back
router.post("/pictures", async (req, res, next) => {
  try {
    const idis = req.body.freinds.map(id => new ObjectId(id))
    // const pictures = await usersCollection.find({ _id: { $in: idis } }, { projection: { baverImg: 1 } }).toArray();
    const pictures = await usersCollection.find({ _id: { $in: idis } }, { projection: { baverImg: 1 , profileImg: 1 } }).toArray();
    console.log("idids:::::::::;", pictures);
    // console.log("pics:::::::::;", pictures);
    res.status(200).json(pictures);
  } catch (error) {
    next(error)
  }
})






export default router;
