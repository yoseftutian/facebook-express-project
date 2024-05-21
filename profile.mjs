import { Router } from "express";
import { profileCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
const router = Router();


router.get("/:_id", async (req, res, next) => {
    try {
        const profile = await profileCollection.findOne({ _id: ObjectId(req.params._id) });
        if (!profile) {
            return res.status(404).send({ error: "Profile not found" });
        }
        res.status(200).send(profile);
    } catch (error) {
        next(error);
    }
});


router.post("/", async (req, res, next) => {
    try {
        const data = [...req.body];
        const insertedProfile = await profileCollection.insertOne(data);
        const profile = await profileCollection
            .find({ _id: { $in: Object.values(insertedProfile.insertedIds) } })
            .toArray();
        res.status(201).send(products);
    } catch (error) {
        next(error);
    }
});

export default router;

