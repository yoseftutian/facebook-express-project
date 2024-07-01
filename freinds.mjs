import { Router } from "express";
import { usersCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
const router = Router();



router.get("/:_id", async (req, res, next) => {
  const userId = new ObjectId(req.params._id);
  try {
    const user = await usersCollection.findOne({ _id: userId });
    if (!user) throw new Error("No user found.");
    const friends = await usersCollection
      .find({ _id: { $in: user.freinds } })
      // { projection: { firstName: 1, lastName: 1, baverImg: 1 } })
      .toArray();
    res.status(200).send(friends);
  } catch (error) {
    next(error);
  }
});


router.post("/addFreind", async (req, res, next) => {
    // const { uid, fid } = req.body;
    const uid = new ObjectId(req.body.uid);
    const fid = new ObjectId(req.body.fid);
    
    try {
        const user1 = await usersCollection.updateOne({_id: uid}, {$addToSet: {freinds: fid}});
        const user2 = await usersCollection.updateOne({_id: fid}, {$addToSet: {freinds: uid}});
        // console.log("user1:", user1, "user2:", user2);
       
        res.status(200).send(true);
    } catch (error) {
        next(error);
    }
});




export default router;
