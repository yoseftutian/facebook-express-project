import { Router } from "express";
import { usersCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
const router = Router();




router.get("/:_id", async (req, res, next) => {
    const userId = new ObjectId(req.params._id);
    try {
        const freindsId = await usersCollection.findOne({ _id: userId }, { projection: { _id: 0, freinds: 1 } });
        console.log(freindsId.freinds);
        if (!freindsId.freinds)
            throw new Error("No friends.")
        const freindsDeaitails = await usersCollection.find({ _id: { $in: freindsId.freinds } }, { projection: { firstName: 1, lastName: 1, baverImg: 1 } }).toArray();
        // console.log(freindsDeaitails);
        console.log(freindsDeaitails);
        res.status(200).send(freindsDeaitails);
    } catch (error) {
        next(error);
    }
});


export default router;

