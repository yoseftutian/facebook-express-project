import { Router } from "express";
import { usersCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
import bcrypt from 'bcrypt';
//token staff
import jwt from 'jsonwebtoken';

const router = Router();

//token staff
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send({ message: 'No token provided' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).send({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};


//Registration endpoint
router.post("/register", async (req, res, next) => {
    try {
        const data = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;
        const insertedUser = await usersCollection.insertOne(data);
        // console.log(insertedUser);
        data["_id"] = insertedUser.insertedId
        console.log(data);
        res.status(201).send(data);
    } catch (error) {
        next(error);
    }
});


// Login endpoint
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
 
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).send(token);
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