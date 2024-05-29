import { Router } from "express"; // Importing the Router class from express
import { client, groupsCollection, usersCollection } from "./database.mjs"; // Importing database client and collections
import { ObjectId } from "mongodb"; // Importing ObjectId to handle MongoDB Object IDs

const router = Router(); // Creating a new router instance

// GET request to fetch a single group by ID
router.get("/:_id", async (req, res, next) => {
  try {
    const group = await groupsCollection.findOne({
      _id: new ObjectId(req.params._id), // Convert the _id parameter to ObjectId
    });
    res.status(200).send(group); // Send the group as response with status 200
  } catch (error) {
    next(error); // Pass any errors to the error-handling middleware
  }
});

// POST request to create a new group
router.post("/", async (req, res, next) => {
  const session = client.startSession(); // Start a new session for transaction

  try {
    session.startTransaction(); // Start the transaction

    const data = req.body; // Get the data from the request body
    const insertedGroup = await groupsCollection.insertOne(data, { session }); // Insert the new group into the groupsCollection within the session
    await usersCollection.updateOne(
      { _id: new ObjectId(data.owner) }, // Find the user by owner ID
      { $push: { groups: insertedGroup.insertedId } }, // Add the new group ID to the user's groups array
      { session } // Pass the session to the update operation
    );
    data["_id"] = insertedGroup.insertedId; // Add the inserted ID to the data object
    await session.commitTransaction(); // Commit the transaction
    res.status(201).send(data); // Send the new group data as response with status 201
  } catch (error) {
    await session.abortTransaction(); // Abort the transaction in case of error
    next(error); // Pass the error to the error-handling middleware
  } finally {
    await session.endSession(); // End the session
  }
});

export default router; // Export the router as default
