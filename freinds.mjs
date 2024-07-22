import { Router } from "express";
import { usersCollection } from "./database.mjs";
import { ObjectId } from "mongodb";

const router = Router();

/**
 * GET /:_id
 * Route to get a user's friends by user ID.
 * 
 * @param {string} _id - The ID of the user.
 * @returns {Array} - A list of the user's friends.
 */
router.get("/:_id", async (req, res, next) => {
  const userId = new ObjectId(req.params._id); // Convert user ID to ObjectId
  try {
    // Find the user by ID
    const user = await usersCollection.findOne({ _id: userId });
    if (!user) throw new Error("No user found.");

    // Find friends of the user
    const friends = await usersCollection
      .find({ _id: { $in: user.freinds } }) // Query to find friends by their IDs
      .toArray();

    // Send the list of friends as a response
    res.status(200).send(friends);
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
});

/**
 * POST /addFreind
 * Route to add a friend to a user's friend list.
 * 
 * @param {string} uid - The user ID.
 * @param {string} fid - The friend ID.
 * @returns {boolean} - Status of the operation.
 */
router.post("/addFreind", async (req, res, next) => {
  // Convert user IDs to ObjectId
  const uid = new ObjectId(req.body.uid);
  const fid = new ObjectId(req.body.fid);

  try {
    // Add friend ID to the user's friends list
    const user1 = await usersCollection.updateOne(
      { _id: uid },
      { $addToSet: { freinds: fid } } // Use $addToSet to avoid duplicates
    );
    // Add user ID to the friend's friends list
    const user2 = await usersCollection.updateOne(
      { _id: fid },
      { $addToSet: { freinds: uid } }
    );

    // Send a response indicating success
    res.status(200).send(true);
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
});

export default router;
